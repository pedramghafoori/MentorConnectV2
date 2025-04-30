import { Request, Response } from 'express';
import { getDriver, fetchCertificationsForLssId } from './lssScraper.js';
import { prisma } from '../db.js';

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
  const userId = req.user?.id; // Assuming you have user data in the request from auth middleware

  if (!lssId) {
    return res.status(400).json({ error: 'Missing lssId in request body' });
  }

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  
  let driver;
  try {
    driver = await getDriver();
    const result = await fetchCertificationsForLssId(driver, lssId);
    if (!result) {
      return res.status(404).json({ error: 'No certifications found or failed to fetch.' });
    }

    // Process awards into a more useful format with dates
    const processedAwards = result.awards
      .filter(award => award.name && award.issued)
      .map(award => ({
        name: award.name!,
        issueDate: new Date(award.issued!)
      }));

    // Check for mentor status
    const isMentor = processedAwards.some(award => 
      award.name.includes(MENTOR_CERTIFICATION)
    );

    // Process each certification category
    const processedCertifications: Record<string, ProcessedCertification> = {};
    
    for (const [category, validAwards] of Object.entries(CERTIFICATION_CATEGORIES)) {
      const relevantAwards = processedAwards.filter(award => 
        validAwards.some(validAward => award.name.includes(validAward))
      );

      if (relevantAwards.length > 0) {
        // Find earliest certification date for this category
        const earliestAward = relevantAwards.reduce((earliest, current) => 
          current.issueDate < earliest.issueDate ? current : earliest
        );

        // Calculate years of experience
        const yearsOfExperience = Math.floor(
          (new Date().getTime() - earliestAward.issueDate.getTime()) / 
          (1000 * 60 * 60 * 24 * 365)
        );

        processedCertifications[category] = {
          category,
          hasCredential: true,
          yearsOfExperience,
          earliestDate: earliestAward.issueDate.toISOString()
        };
      } else {
        processedCertifications[category] = {
          category,
          hasCredential: false,
          yearsOfExperience: 0,
          earliestDate: null
        };
      }
    }

    // If user is a mentor, update their role in the database
    if (isMentor) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: 'MENTOR' }
      });
    }

    // Return both certifications and mentor status
    const response: CertificationResponse = {
      certifications: processedCertifications,
      isMentor
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getCertifications:', error);
    res.status(500).json({ error: 'Error fetching certifications', details: error });
  } finally {
    if (driver) await driver.quit();
  }
}; 