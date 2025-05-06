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
  INSTRUCTOR_TRAINER_FIRST_AID: ['Instructor Trainer - Standard First Aid']
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
  let driver = null;

  if (!lssId) {
    return res.status(400).json({ error: 'LSS ID is required' });
  }

  try {
    console.log('Starting certification fetch for LSS ID:', lssId);
    
    // Get driver
    console.log('Getting Chrome driver...');
    driver = await getDriver();
    console.log('Chrome driver obtained successfully');

    // Fetch certifications
    console.log('Fetching certifications...');
    const result = await fetchCertificationsForLssId(driver, lssId);
    console.log('Certifications fetched:', result);

    if (!result) {
      return res.status(404).json({ error: 'No certifications found' });
    }

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
          const years = award.daysLeft ? Math.floor(award.daysLeft / 365) : 0;
          processedCertifications[category] = {
            category,
            hasCredential: true,
            yearsOfExperience: years,
            earliestDate: award.issued
          };
          break;
        }
      }
    });

    // If user is authenticated, update their certifications
    if (req.user?.id) {
      console.log('User is authenticated, updating certifications...');
      try {
        // Transform to array of { type, years }
        const certificationObjects = Object.entries(processedCertifications)
          .filter(([_, cert]) => cert.hasCredential)
          .map(([category, cert]) => ({
            type: category,
            years: cert.yearsOfExperience
          }));

        // Create update object
        const updateData: any = {
          certifications: certificationObjects
        };
        
        // Add role update if user is a mentor
        if (isMentor) {
          updateData.role = 'MENTOR';
        }

        // Update user in MongoDB
        await User.findByIdAndUpdate(req.user.id, updateData);
        
        console.log('User certifications updated successfully');
      } catch (dbError) {
        console.error('Error updating user certifications:', dbError);
        // Don't fail the request if DB update fails
      }
    }

    // Return processed certifications
    return res.json({
      certifications: processedCertifications,
      isMentor
    });
  } catch (error) {
    console.error('Error in getCertifications:', error);
    return res.status(500).json({ 
      error: 'Error fetching certifications',
      details: error
    });
  } finally {
    if (driver) {
      try {
        console.log('Quitting Chrome driver...');
        await driver.quit();
        console.log('Chrome driver quit successfully');
      } catch (quitError) {
        console.error('Error quitting Chrome driver:', quitError);
      }
    }
  }
}; 