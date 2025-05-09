import { Request, Response } from 'express';
import { SignedWaiver } from '../models/SignedWaiver.js';
import { Waiver } from '../models/Waiver.js';
import { buildPdf } from '../utils/pdfUtils.js';
import { sendPdfEmail } from '../utils/emailUtils.js';
import { MENTOR_WAIVER_TEXT } from '../constants/mentorWaiver.js';
import { Types } from 'mongoose';

interface PopulatedMentor {
  _id: Types.ObjectId;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'MENTOR' | 'STUDENT';
}

interface PopulatedSignedWaiver {
  _id: Types.ObjectId;
  mentor: PopulatedMentor;
  waiver: {
    _id: Types.ObjectId;
    title: string;
  };
  waiverText: string;
  signaturePng: string;
  signedAt: Date;
}

interface RequestWithUser extends Request {
  user: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    userId?: string;
  };
}

export const getLatestWaiver = async (req: Request, res: Response) => {
 
  
  try {
    
    let waiver = await Waiver.findOne().sort({ createdAt: -1 });
    
    
    // If no waiver exists, create the initial one
    if (!waiver) {
      console.log('No waiver found, creating initial waiver with template:', MENTOR_WAIVER_TEXT);
      waiver = await Waiver.create(MENTOR_WAIVER_TEXT);
      console.log('Created new waiver:', waiver);
    }
    

    res.json(waiver);
  } catch (error: any) {


    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const signWaiver = async (req: Request, res: Response) => {



  
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
    const signedWaiver = await SignedWaiver.create({
      waiver: waiver._id,
      mentor: req.user.userId,
      waiverText: waiver.text,
      signaturePng: signaturePng,
      signedAt: new Date()
    });
    console.log('Created signed waiver record:', signedWaiver._id);

    try {
      // Generate PDF in-memory for email
      console.log('Generating PDF...');
      const pdfBytes = await buildPdf(waiver.text, signaturePng, {
        name: req.user.fullName,
        date: signedWaiver.signedAt,
      });
      console.log('PDF generated successfully');

      // Try to send email, but don't fail if it doesn't work
      try {
        console.log('Sending email...');
        await sendPdfEmail({
          to: req.user.email,
          pdfBytes,
          filename: `MentorConnect-Waiver-${signedWaiver._id}.pdf`,
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
    res.json({ signedWaiverId: signedWaiver._id });
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

export const getSignedWaivers = async (req: Request, res: Response) => {
  console.log('=== getSignedWaivers called ===');
  try {
    const signedWaivers = await SignedWaiver.find()
      .populate('mentor', 'fullName email')
      .populate('waiver', 'title')
      .sort({ signedAt: -1 });

    res.json(signedWaivers);
  } catch (error: any) {
    console.error('Error in getSignedWaivers:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

export const downloadSignedWaiverPdf = async (req: Request, res: Response) => {
  try {
    console.log('=== downloadSignedWaiverPdf called ===');
    console.log('Request params:', req.params);
    console.log('User:', req.user);

    const { id } = req.params;
    console.log('Finding signed waiver with ID:', id);

    // Find the signed waiver and populate the mentor
    const signedWaiver = await SignedWaiver.findById(id)
      .populate('mentor', 'fullName firstName lastName email')
      .lean();

    if (!signedWaiver) {
      console.log('Signed waiver not found');
      return res.status(404).json({ error: 'Signed waiver not found' });
    }

    // Type assertion for the lean document
    const typedWaiver = signedWaiver as unknown as PopulatedSignedWaiver;

    console.log('Found signed waiver:', {
      id: typedWaiver._id,
      hasMentor: !!typedWaiver.mentor,
      mentorType: typeof typedWaiver.mentor
    });

    // Check if the requesting user is authorized
    if (typedWaiver.mentor && 
        typedWaiver.mentor._id.toString() !== req.user.userId && 
        req.user.role !== 'ADMIN') {
      console.log('Unauthorized access attempt');
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate PDF
    console.log('Generating PDF...');
    // Try to get the mentor's name from fullName, or fallback to firstName + lastName, or 'Unknown'
    let mentorName = 'Unknown';
    if (typedWaiver.mentor) {
      if (typedWaiver.mentor.fullName) {
        mentorName = typedWaiver.mentor.fullName;
      } else if (typedWaiver.mentor.firstName && typedWaiver.mentor.lastName) {
        mentorName = `${typedWaiver.mentor.firstName} ${typedWaiver.mentor.lastName}`;
      }
    }
    const pdfBytes = await buildPdf(
      typedWaiver.waiverText,
      typedWaiver.signaturePng,
      {
        name: mentorName,
        date: typedWaiver.signedAt
      }
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=MentorConnect-Waiver-${id}.pdf`);
    res.setHeader('Content-Length', pdfBytes.length);
    
    // Send the PDF
    res.send(Buffer.from(pdfBytes));
  } catch (error: any) {
    console.error('Error in downloadSignedWaiverPdf:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verifyMentorSignature = async (req: Request, res: Response) => {
  console.log('=== verifyMentorSignature called ===');
  try {
    const mentorId = req.params.mentorId;
    
    // Get the latest waiver
    const latestWaiver = await Waiver.findOne().sort({ createdAt: -1 });
    if (!latestWaiver) {
      return res.status(404).json({ message: 'No waiver template found' });
    }

    // Check if the mentor has signed the latest waiver
    const signedWaiver = await SignedWaiver.findOne({
      mentor: mentorId,
      waiver: latestWaiver._id
    });

    res.json({
      hasSigned: !!signedWaiver,
      signedAt: signedWaiver?.signedAt || null,
      waiverId: signedWaiver?._id || null
    });
  } catch (error: any) {
    console.error('Error in verifyMentorSignature:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}; 