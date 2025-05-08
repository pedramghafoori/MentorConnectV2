import { Request, Response } from 'express';
import { getDriver, fetchCertificationsForLssId } from './lssScraper.js';
import { User } from '../models/user.js';
import { CertificationCategory } from '../models/certificationCategory.js';
import jwt from 'jsonwebtoken';

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
  const { lssId, userId: bodyUserId } = req.body;
  const sessionUserId = req.user?.userId;
  // Prefer userId from body if present, otherwise from session
  const effectiveUserId = bodyUserId || sessionUserId;
  const isRegistration = !sessionUserId && !bodyUserId; // If neither, this is registration

  if (!lssId) {
    return res.status(400).json({ error: 'Missing lssId in request body' });
  }
  
  let driver;
  try {
    // Fetch all certification categories from the database
    const certificationCategories = await CertificationCategory.find().lean();
    if (!certificationCategories.length) {
      return res.status(500).json({ error: 'No certification categories found in database' });
    }

    // Convert to the format needed for processing
    const CERTIFICATION_CATEGORIES: Record<string, string[]> = {};
    certificationCategories.forEach(cat => {
      CERTIFICATION_CATEGORIES[cat.code] = cat.validAwards;
    });

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
    
   
    processedAwards.forEach(award => {
     
    });

    // Check for mentor status
    const isMentor = processedAwards.some(award => 
      award.name.includes(MENTOR_CERTIFICATION)
    );
    console.log(`\nMentor Status: ${isMentor ? 'Yes' : 'No'}`);
    console.log('bodyUserId:', bodyUserId, 'sessionUserId:', sessionUserId, 'effectiveUserId:', effectiveUserId);

    // Process each certification category
    const processedCertifications: Record<string, ProcessedCertification> = {};
    const certificationObjects: { type: string; years: number }[] = [];
    
   
    for (const [category, validAwards] of Object.entries(CERTIFICATION_CATEGORIES)) {
     
      
      const relevantAwards = processedAwards.filter(award => 
        validAwards.some(validAward => award.name.includes(validAward))
      );
      
     
      relevantAwards.forEach(award => {
       
      });

      if (relevantAwards.length > 0) {
        // Find earliest certification date for this category
        const earliestAward = relevantAwards.reduce((earliest, current) => 
          current.issueDate < earliest.issueDate ? current : earliest
        );
        

        // Calculate years of experience
        const currentYear = new Date().getFullYear();
        const issueYear = earliestAward.issueDate.getFullYear();
        const yearsOfExperience = currentYear - issueYear;

        processedCertifications[category] = {
          category,
          hasCredential: true,
          yearsOfExperience,
          earliestDate: earliestAward.issueDate.toISOString()
        };

        // Add to object array for database storage
        certificationObjects.push({ type: category, years: yearsOfExperience });
      } else {
       
        processedCertifications[category] = {
          category,
          hasCredential: false,
          yearsOfExperience: 0,
          earliestDate: null
        };
      }
    }


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
    } else if (effectiveUserId) {
      // Update existing user's data (either from session or from body)
      if (isMentor) {
        const updatedUser = await User.findByIdAndUpdate(
          effectiveUserId, 
          { 
          role: 'MENTOR',
          certifications: certificationObjects
          },
          { new: true } // Return the updated document
        );
        console.log('Updated user:', updatedUser);

        if (updatedUser) {
          // Generate new token with updated role
          const newToken = jwt.sign(
            { 
              userId: updatedUser._id, 
              email: updatedUser.email, 
              role: updatedUser.role 
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
          );

          // Set the new token in a cookie
          res.cookie('token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            domain: process.env.NODE_ENV === 'production' ? 'mentorconnect-ecc82a256094.herokuapp.com' : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        }
      } else {
        const updateResult = await User.findByIdAndUpdate(effectiveUserId, { 
          certifications: certificationObjects
        });
        console.log('User update result:', updateResult);
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