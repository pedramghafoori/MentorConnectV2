import { Request, Response } from 'express';
import { getDriver, fetchCertificationsForLssId } from './lssScraper.js';
import { User } from '../models/user.js';
import chromedriver from 'chromedriver';

// Define certification categories and their corresponding awards
const CERTIFICATION_CATEGORIES = {
  FIRST_AID_INSTRUCTOR: ['Standard First Aid Instructor', 'Emergency First Aid Instructor'],
  LIFESAVING_INSTRUCTOR: ['Lifesaving Instructor', 'Swim Instructor'],
  NL_INSTRUCTOR: ['National Lifeguard Instructor'],
  EXAMINER_FIRST_AID: ['Examiner - Standard First Aid'],
  EXAMINER_NL: ['Examiner - National Lifeguard'],
  EXAMINER_BRONZE: ['Examiner - Bronze Cross'],
  INSTRUCTOR_TRAINER_LIFESAVING: ['Instructor Trainer - Lifesaving'],
  INSTRUCTOR_TRAINER_NL: ['Instructor Trainer - National Lifeguard'],
  INSTRUCTOR_TRAINER_FIRST_AID: ['Instructor Trainer - Standard First Aid'],
  INSTRUCTOR_TRAINER_SWIM: ['Instructor Trainer - Swim']
};

// Special certification that grants mentor status
const MENTOR_CERTIFICATION = 'Examiner Mentor';

interface ProcessedCertification {
  category: string;
  hasCredential: boolean;
  yearsOfExperience: number;
  earliestDate: string | null;
}

interface CertificationResponse {
  certifications: Record<string, ProcessedCertification>;
  isMentor: boolean;
}

export const getCertifications = async (req: Request, res: Response) => {
  const { lssId } = req.body;
  
  if (!lssId) {
    return res.status(400).json({ error: 'LSS ID is required' });
  }
  
  console.log(`Starting certification fetch for LSS ID: ${lssId}`);
  
  try {
    console.log('Getting Chrome driver...');
    const browser = await getDriver();
    console.log('Chrome driver obtained successfully');
    
    console.log('Fetching certifications...');
    const result = await fetchCertificationsForLssId(browser, lssId);
    console.log('Certifications fetched:', result);
    
    if (result) {
      // Process awards into certification categories
      const processedCertifications: Record<string, ProcessedCertification> = {};
      let isMentor = false;

      // Initialize all categories as not having credentials
      Object.keys(CERTIFICATION_CATEGORIES).forEach(category => {
        processedCertifications[category] = {
          category,
          hasCredential: false,
          yearsOfExperience: 0,
          earliestDate: null
        };
      });

      // Process each award
      result.awards.forEach(award => {
        if (!award.name) return;

        // Check for mentor certification
        if (award.name.includes(MENTOR_CERTIFICATION)) {
          isMentor = true;
        }

        // Find matching category
        for (const [category, validAwards] of Object.entries(CERTIFICATION_CATEGORIES)) {
          if (validAwards.some(validAward => award.name?.includes(validAward))) {
            // Calculate years of experience for this specific certification
            let yearsOfExperience = 0;
            if (award.issued) {
              const issueDate = new Date(award.issued);
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - issueDate.getTime());
              yearsOfExperience = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
              console.log(`Calculated ${yearsOfExperience} years for ${award.name} from ${issueDate.toISOString()}`);
            }

            processedCertifications[category] = {
              category,
              hasCredential: true,
              yearsOfExperience,
              earliestDate: award.issued
            };
            break;
          }
        }
      });

      // Calculate overall years of experience based on earliest certification
      let earliestDate: Date | null = null;
      result.awards.forEach(award => {
        if (award.issued) {
          const issueDate = new Date(award.issued);
          if (!earliestDate || issueDate.getTime() < earliestDate.getTime()) {
            earliestDate = issueDate;
          }
        }
      });
      
      const overallYearsOfExperience = earliestDate 
        ? Math.floor((new Date().getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : 0;
      
      console.log('Overall years of experience:', overallYearsOfExperience);
      
      // Update the user's years of experience and certifications in the database
      await User.findOneAndUpdate(
        { lssId },
        { 
          $set: { 
            yearsOfExperience: overallYearsOfExperience,
            certifications: Object.entries(processedCertifications)
              .filter(([_, cert]) => cert.hasCredential)
              .map(([category, cert]) => ({
                type: category,
                years: cert.yearsOfExperience
              })),
            isMentor
          }
        },
        { new: true }
      );
      
      res.json({ 
        certifications: processedCertifications,
        isMentor,
        yearsOfExperience: overallYearsOfExperience
      });
    } else {
      res.status(404).json({ error: 'No certifications found' });
    }
    
    console.log('Quitting Chrome driver...');
    await browser.close();
    console.log('Chrome driver quit successfully');
  } catch (error) {
    console.error('Error in getCertifications:', error);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
}; 