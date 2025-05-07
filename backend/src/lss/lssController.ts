import { Request, Response } from 'express';
import { getDriver, fetchCertificationsForLssId } from './lssScraper.js';
import { User } from '../models/user.js';

// Extend Express Request type to include session
declare module 'express' {
  interface Request {
    session?: {
      registrationData?: {
        isMentor: boolean;
        certifications: { type: string; years: number }[];
        name: string;
        lssId: string;
      };
    };
  }
}

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
  registrationData?: {
    isMentor: boolean;
    certifications: { type: string; years: number }[];
    name: string;
  };
}

export const getCertifications = async (req: Request, res: Response) => {
  const { lssId } = req.body;
  const userId = req.user?.userId;
  const isRegistration = !userId; // If no userId, this is registration

  if (!lssId) {
    return res.status(400).json({ error: 'Missing lssId in request body' });
  }
  
  let driver;
  try {
    driver = await getDriver();
    const result = await fetchCertificationsForLssId(driver, lssId);
    if (!result) {
      return res.status(404).json({ error: 'No certifications found or failed to fetch.' });
    }

    console.log('\n=== Processing Certifications ===');
    // Process awards into a more useful format with dates
    const processedAwards = result.awards
      .filter(award => award.name && award.issued)
      .map(award => ({
        name: award.name!,
        issueDate: new Date(award.issued!)
      }));
    
    console.log('\nAll Valid Awards:');
    processedAwards.forEach(award => {
      console.log(`- ${award.name} (Issued: ${award.issueDate.toISOString()})`);
    });

    // Check for mentor status
    const isMentor = processedAwards.some(award => 
      award.name.includes(MENTOR_CERTIFICATION)
    );
    console.log(`\nMentor Status: ${isMentor ? 'Yes' : 'No'}`);

    // Process each certification category
    const processedCertifications: Record<string, ProcessedCertification> = {};
    const certificationObjects: { type: string; years: number }[] = [];
    
    console.log('\n=== Processing Categories ===');
    for (const [category, validAwards] of Object.entries(CERTIFICATION_CATEGORIES)) {
      console.log(`\nCategory: ${category}`);
      console.log(`Valid Awards for this category: ${validAwards.join(', ')}`);
      
      const relevantAwards = processedAwards.filter(award => 
        validAwards.some(validAward => award.name.includes(validAward))
      );
      
      console.log(`Found ${relevantAwards.length} relevant awards:`);
      relevantAwards.forEach(award => {
        console.log(`- ${award.name} (Issued: ${award.issueDate.toISOString()})`);
      });

      if (relevantAwards.length > 0) {
        // Find earliest certification date for this category
        const earliestAward = relevantAwards.reduce((earliest, current) => 
          current.issueDate < earliest.issueDate ? current : earliest
        );
        
        console.log(`\nEarliest Award for ${category}:`);
        console.log(`- Name: ${earliestAward.name}`);
        console.log(`- Issue Date: ${earliestAward.issueDate.toISOString()}`);

        // Calculate years of experience
        const currentYear = new Date().getFullYear();
        const issueYear = earliestAward.issueDate.getFullYear();
        const yearsOfExperience = currentYear - issueYear;
        
        console.log(`Years Calculation:`);
        console.log(`- Current Year: ${currentYear}`);
        console.log(`- Issue Year: ${issueYear}`);
        console.log(`- Years of Experience: ${yearsOfExperience}`);

        processedCertifications[category] = {
          category,
          hasCredential: true,
          yearsOfExperience,
          earliestDate: earliestAward.issueDate.toISOString()
        };

        // Add to object array for database storage
        certificationObjects.push({ type: category, years: yearsOfExperience });
      } else {
        console.log(`No relevant awards found for ${category}`);
        processedCertifications[category] = {
          category,
          hasCredential: false,
          yearsOfExperience: 0,
          earliestDate: null
        };
      }
    }

    console.log('\n=== Final Processed Certifications ===');
    console.log(JSON.stringify(processedCertifications, null, 2));

    // If this is registration, store the data in session
    if (isRegistration) {
      // Store certification data in session for registration
      if (!req.session) {
        req.session = {};
      }
      req.session.registrationData = {
        isMentor,
        certifications: certificationObjects,
        name: result.name,
        lssId
      };
    } else if (userId) {
      // Update existing user's data
      if (isMentor) {
        await User.findByIdAndUpdate(userId, { 
          role: 'MENTOR',
          certifications: certificationObjects
        });
      } else {
        await User.findByIdAndUpdate(userId, { 
          certifications: certificationObjects
        });
      }
    }

    // Return both certifications and mentor status
    const response: CertificationResponse = {
      certifications: processedCertifications,
      isMentor,
      // Include registration data if this is registration
      ...(isRegistration && {
        registrationData: {
          isMentor,
          certifications: certificationObjects,
          name: result.name
        }
      })
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getCertifications:', error);
    res.status(500).json({ error: 'Error fetching certifications', details: error });
  } finally {
    if (driver) await driver.quit();
  }
}; 