import { Request, Response } from 'express';
import { SignedWaiver } from '../models/SignedWaiver.js';
import { Waiver } from '../models/Waiver.js';
import { buildPdf } from '../utils/pdfUtils.js';
import { sendPdfEmail } from '../utils/emailUtils.js';
import { MENTOR_WAIVER } from '../constants/mentorWaiver.js';
import { Types } from 'mongoose';

interface PopulatedSignedWaiver extends Document {
  _id: Types.ObjectId;
  mentor: Types.ObjectId;
  waiver: {
    text: string;
  };
  waiverText: string;
  signaturePng: string;
  signedAt: Date;
}

export const getLatestWaiver = async (req: Request, res: Response) => {
  console.log('=== getLatestWaiver called ===');
  console.log('Request headers:', req.headers);
  console.log('User from request:', req.user);
  console.log('Cookies:', req.cookies);
  
  try {
    console.log('Attempting to find latest waiver in database...');
    let waiver = await Waiver.findOne().sort({ createdAt: -1 });
    console.log('Database query result:', waiver);
    
    // If no waiver exists, create the initial one
    if (!waiver) {
      console.log('No waiver found, creating initial waiver with template:', MENTOR_WAIVER);
      waiver = await Waiver.create(MENTOR_WAIVER);
      console.log('Created new waiver:', waiver);
    }
    
    console.log('Sending response with waiver:', waiver);
    res.json(waiver);
  } catch (error: any) {
    console.error('Error in getLatestWaiver:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const signWaiver = async (req: Request, res: Response) => {
  console.log('=== signWaiver called ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  
  try {
    const { signaturePng } = req.body;
    if (!signaturePng?.startsWith('data:image/png')) {
      console.log('Invalid signature format');
      return res.status(400).json({ message: 'Invalid signature format' });
    }

    // Get the latest waiver
    console.log('Finding latest waiver...');
    const waiver = await Waiver.findOne().sort({ createdAt: -1 });
    if (!waiver) {
      console.log('No waiver template found');
      return res.status(404).json({ message: 'No waiver template found' });
    }
    console.log('Found waiver:', waiver._id);

    console.log('Creating signed waiver record...');
    const record = await SignedWaiver.findOneAndUpdate(
      { mentor: req.user._id, waiver: waiver._id },
      { 
        signaturePng, 
        signedAt: new Date(),
        waiverText: waiver.text // Store the exact waiver text that was signed
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log('Created signed waiver record:', record._id);

    try {
      // Generate PDF in-memory for email
      console.log('Generating PDF...');
      const pdfBytes = await buildPdf(waiver.text, signaturePng, {
        name: req.user.fullName,
        date: record.signedAt,
      });
      console.log('PDF generated successfully');

      // Try to send email, but don't fail if it doesn't work
      try {
        console.log('Sending email...');
        await sendPdfEmail({
          to: req.user.email,
          pdfBytes,
          filename: `MentorConnect-Waiver-${record._id}.pdf`,
        });
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Continue execution even if email fails
      }
    } catch (pdfError) {
      console.error('Failed to generate PDF:', pdfError);
      // Continue execution even if PDF generation fails
    }

    console.log('Sending response...');
    res.json({ signedWaiverId: record._id });
  } catch (error: any) {
    console.error('Error in signWaiver:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const downloadSignedWaiverPdf = async (req: Request, res: Response) => {
  const doc = await SignedWaiver.findById(req.params.id).populate('waiver') as PopulatedSignedWaiver | null;
  if (!doc || doc.mentor.toString() !== req.user._id.toString()) {
    return res.sendStatus(404);
  }

  // Use the stored waiver text instead of the current template
  const pdfBytes = await buildPdf(doc.waiverText, doc.signaturePng, {
    name: req.user.fullName,
    date: doc.signedAt,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="MentorConnect-Waiver-${doc._id}.pdf"`
  );
  res.send(Buffer.from(pdfBytes));
}; 