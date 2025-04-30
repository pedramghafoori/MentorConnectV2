import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';
import { Review } from '../models/review.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// Configure multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/users/me/profile-picture - Upload new profile picture
router.post('/me/profile-picture', authenticateToken, upload.single('file'), async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the current user to find the old profile picture
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the old profile picture if it exists
    if (user.avatarUrl) {
      const oldFilePath = path.join(__dirname, '../../uploads', path.basename(user.avatarUrl));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update user with new profile picture URL
    const newAvatarUrl = `/uploads/${file.filename}`;
    user.avatarUrl = newAvatarUrl;
    await user.save();

    res.json({ url: newAvatarUrl });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture', error });
  }
});

// GET /api/users/me - Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// PATCH /api/users/me - Update current user's profile (e.g., avatarUrl)
router.patch('/me', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/users/:userId/reviews - Get paginated reviews for a user
router.get('/:userId/reviews', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;

  try {
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ user: userId });
    const nextPage = page * limit < total ? page + 1 : null;

    res.json({
      reviews,
      nextPage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
});

// GET /api/users/search - Search users by name, LSS ID, or certifications
router.get('/search', authenticateToken, async (req, res) => {
  const query = req.query.query?.toString().trim();
  const currentUserId = req.user?.userId;
  const certs = req.query.certifications
    ? req.query.certifications.toString().split(',').map(s => s.trim()).filter(Boolean)
    : [];

  if (!query && certs.length === 0) return res.json([]);
  try {
    const certsFilter = certs.length
      ? { certifications: { $all: certs } }
      : {};
    const users = await User.find({
      $and: [
        {
          $or: [
            { firstName: { $regex: query || '', $options: 'i' } },
            { lastName: { $regex: query || '', $options: 'i' } },
            { lssId: { $regex: query || '', $options: 'i' } },
            { certifications: { $elemMatch: { $regex: query || '', $options: 'i' } } }
          ]
        },
        certsFilter,
        { _id: { $ne: currentUserId } }
      ]
    }).select('firstName lastName avatarUrl lssId role certifications');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
});

// GET /api/users/:userId - Get public profile by userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// --- CONNECTIONS SYSTEM ---
// Send connection request
router.post('/:userId/connect', authenticateToken, async (req, res) => {
  const fromUserId = req.user?.userId;
  const toUserId = req.params.userId;
  if (!fromUserId || !toUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  if (fromUserId === toUserId) return res.status(400).json({ message: 'Cannot connect to yourself.' });
  try {
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: 'User not found.' });
    if (toUser.connectionRequests.map(id => id.toString()).includes(fromUserId) || toUser.connections.map(id => id.toString()).includes(fromUserId)) {
      return res.status(400).json({ message: 'Already requested or connected.' });
    }
    toUser.connectionRequests.push(new mongoose.Types.ObjectId(fromUserId));
    await toUser.save();
    res.json({ message: 'Connection request sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Accept connection request
router.post('/:userId/accept', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  const fromUserId = req.params.userId;
  if (!myUserId || !fromUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  try {
    const me = await User.findById(myUserId);
    const fromUser = await User.findById(fromUserId);
    if (!me || !fromUser) return res.status(404).json({ message: 'User not found.' });
    if (!me.connectionRequests.map(id => id.toString()).includes(fromUserId)) {
      return res.status(400).json({ message: 'No pending request from this user.' });
    }
    // Add each other as connections
    me.connections.push(new mongoose.Types.ObjectId(fromUserId));
    fromUser.connections.push(new mongoose.Types.ObjectId(myUserId));
    // Remove request
    me.connectionRequests = me.connectionRequests.filter(id => id.toString() !== fromUserId);
    await me.save();
    await fromUser.save();
    res.json({ message: 'Connection accepted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Reject connection request
router.post('/:userId/reject', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  const fromUserId = req.params.userId;
  if (!myUserId || !fromUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  try {
    const me = await User.findById(myUserId);
    if (!me) return res.status(404).json({ message: 'User not found.' });
    if (!me.connectionRequests.map(id => id.toString()).includes(fromUserId)) {
      return res.status(400).json({ message: 'No pending request from this user.' });
    }
    me.connectionRequests = me.connectionRequests.filter(id => id.toString() !== fromUserId);
    await me.save();
    res.json({ message: 'Connection request rejected.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Remove connection
router.delete('/:userId/connection', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  const otherUserId = req.params.userId;
  if (!myUserId || !otherUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  try {
    const me = await User.findById(myUserId);
    const other = await User.findById(otherUserId);
    if (!me || !other) return res.status(404).json({ message: 'User not found.' });
    me.connections = me.connections.filter(id => id.toString() !== otherUserId);
    other.connections = other.connections.filter(id => id.toString() !== myUserId);
    await me.save();
    await other.save();
    res.json({ message: 'Connection removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// List my connections
router.get('/me/connections', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  try {
    const me = await User.findById(myUserId).populate('connections', 'firstName lastName avatarUrl lssId role');
    if (!me) return res.status(404).json({ message: 'User not found.' });
    res.json(me.connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// List my pending connection requests
router.get('/me/connection-requests', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  try {
    const me = await User.findById(myUserId).populate('connectionRequests', 'firstName lastName avatarUrl lssId role');
    if (!me) return res.status(404).json({ message: 'User not found.' });
    res.json(me.connectionRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Cancel a sent connection request
router.delete('/:userId/request', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  const toUserId = req.params.userId;
  if (!myUserId || !toUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  try {
    const toUser = await User.findById(toUserId);
    if (!toUser) return res.status(404).json({ message: 'User not found.' });
    // Remove your ID from their connectionRequests
    const before = toUser.connectionRequests.length;
    toUser.connectionRequests = toUser.connectionRequests.filter(id => id.toString() !== myUserId);
    if (toUser.connectionRequests.length === before) {
      return res.status(400).json({ message: 'No pending request to cancel.' });
    }
    await toUser.save();
    res.json({ message: 'Connection request cancelled.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get connection status between current user and another user
router.get('/:userId/connection-status', authenticateToken, async (req, res) => {
  const myUserId = req.user?.userId;
  const otherUserId = req.params.userId;
  if (!myUserId || !otherUserId) return res.status(400).json({ message: 'Invalid user ID.' });
  try {
    const me = await User.findById(myUserId);
    const other = await User.findById(otherUserId);
    if (!me || !other) return res.status(404).json({ message: 'User not found.' });
    const sent = other.connectionRequests.map(id => id.toString()).includes(myUserId);
    const received = me.connectionRequests.map(id => id.toString()).includes(otherUserId);
    const connected = me.connections.map(id => id.toString()).includes(otherUserId);
    res.json({ sent, received, connected });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get connections for any user by ID
router.get('/:userId/connections', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('connections', 'firstName lastName avatarUrl lssId role');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.connections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router; 