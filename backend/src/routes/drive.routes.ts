import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { google, drive_v3 } from 'googleapis';
import { User } from '../models/user.js';
import multer from 'multer';
import { Readable } from 'stream';
import { GaxiosResponse } from 'gaxios';

const router = Router();
const upload = multer();

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate auth URL
router.get('/auth-url', authenticateToken, (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];

  const state = req.user?.userId; // Include user ID in state for callback
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
    prompt: 'consent' // Force consent screen to get refresh token
  });

  res.json({ authUrl });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state) {
    return res.status(400).json({ message: 'Missing code or state' });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const userInfo = await drive.about.get({ fields: 'user' });
    console.log('[Drive OAuth] Google user info:', userInfo.data.user);

    // Create or update app folder
    const folderName = 'MentorConnect Files';
    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    let folderId = folderResponse.data.files?.[0]?.id;
    if (!folderId) {
      const folder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });
      folderId = folder.data.id;
    }

    // Extract Google account ID and email
    const googleAccountId = userInfo.data.user?.permissionId || null;
    const googleAccountEmail = userInfo.data.user?.emailAddress || null;
    console.log('[Drive OAuth] Extracted googleAccountId:', googleAccountId, 'googleAccountEmail:', googleAccountEmail);

    // Update user with tokens, folder ID, and Google account info
    const updateResult = await User.findByIdAndUpdate(state, {
      'googleDrive.refreshToken': tokens.refresh_token,
      'googleDrive.accessToken': tokens.access_token,
      'googleDrive.accessTokenExpiry': new Date(tokens.expiry_date!),
      'googleDrive.driveFolderId': folderId,
      'googleDrive.connectedAt': new Date(),
      'googleDrive.googleAccountId': googleAccountId,
      'googleDrive.googleAccountEmail': googleAccountEmail
    }, { new: true });
    console.log('[Drive OAuth] User update result:', updateResult);

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/settings?drive=connected`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?drive=error`);
  }
});

// Upload file to Drive
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const user = await User.findById(req.user?.userId);
    if (!user?.googleDrive?.refreshToken) {
      return res.status(400).json({ message: 'Google Drive not connected' });
    }

    // Set up OAuth2 client with user's refresh token
    oauth2Client.setCredentials({
      refresh_token: user.googleDrive.refreshToken
    });

    // Refresh token if expired
    if (new Date() > new Date(user.googleDrive.accessTokenExpiry)) {
      const response = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(response.credentials);
      await User.findByIdAndUpdate(user._id, {
        'googleDrive.accessToken': response.credentials.access_token,
        'googleDrive.accessTokenExpiry': new Date(response.credentials.expiry_date!)
      });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Create file metadata
    const fileMetadata: drive_v3.Schema$File = {
      name: req.file.originalname,
      parents: [user.googleDrive.driveFolderId]
    };

    // Create file stream
    const fileStream = new Readable();
    fileStream.push(req.file.buffer);
    fileStream.push(null);

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: req.file.mimetype,
        body: fileStream
      },
      fields: 'id, name, webViewLink'
    });

    const file = response.data;

    // If we have the counterpart's email, share the file
    if (req.body.counterpartEmail) {
      try {
        await drive.permissions.create({
          fileId: file.id!,
          requestBody: {
            role: 'reader',
            type: 'user',
            emailAddress: req.body.counterpartEmail
          }
        });
      } catch (error) {
        console.error('Error sharing file:', error);
        // Continue even if sharing fails
      }
    }

    res.json({
      fileId: file.id,
      fileName: file.name,
      webViewLink: file.webViewLink
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Share file with another user
router.post('/share', authenticateToken, async (req, res) => {
  try {
    const { fileId, email, role = 'reader' } = req.body;
    if (!fileId || !email) {
      return res.status(400).json({ message: 'Missing fileId or email' });
    }

    const user = await User.findById(req.user?.userId);
    if (!user?.googleDrive?.refreshToken) {
      return res.status(400).json({ message: 'Google Drive not connected' });
    }

    // Set up OAuth2 client
    oauth2Client.setCredentials({
      refresh_token: user.googleDrive.refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Add permission
    await drive.permissions.create({
      fileId,
      requestBody: {
        role,
        type: 'user',
        emailAddress: email
      }
    });

    res.json({ message: 'File shared successfully' });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ message: 'Error sharing file' });
  }
});

export default router; 