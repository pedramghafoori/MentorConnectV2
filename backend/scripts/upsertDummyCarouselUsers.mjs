// scripts/upsertDummyCarouselUsers.mjs
// Run this script with: npx tsx scripts/upsertDummyCarouselUsers.mjs
import mongoose from 'mongoose';
import { User } from '../src/models/user.js';
import fs from 'fs';
import path from 'path';

const MONGO_URI = 'mongodb://localhost:27017/mentorconnect';

const randomNames = [
  { firstName: 'Alice', lastName: 'Smith', gender: 'female' },
  { firstName: 'Bob', lastName: 'Johnson', gender: 'male' },
  { firstName: 'Charlie', lastName: 'Lee', gender: 'male' },
  { firstName: 'Diana', lastName: 'Wong', gender: 'female' },
  { firstName: 'Ethan', lastName: 'Patel', gender: 'male' },
  { firstName: 'Fiona', lastName: 'Kim', gender: 'female' },
  { firstName: 'George', lastName: 'Brown', gender: 'male' },
  { firstName: 'Hannah', lastName: 'Garcia', gender: 'female' },
  { firstName: 'Ivan', lastName: 'Martinez', gender: 'male' },
  { firstName: 'Julia', lastName: 'Nguyen', gender: 'female' }
];

// Count gender distribution
const genderCounts = randomNames.reduce((acc, { gender }) => {
  acc[gender] = (acc[gender] || 0) + 1;
  return acc;
}, {});

// Pre-assign mentor roles to specific users (3 out of 10 = 30%)
const mentorIndices = [2, 5, 8]; // Charlie Lee, Fiona Kim, and Ivan Martinez will be mentors

const certTypes = [
  'INSTRUCTOR_TRAINER_FIRST_AID',
  'INSTRUCTOR_TRAINER_LIFESAVING',
  'INSTRUCTOR_TRAINER_NL',
  'EXAMINER_NL',
  'EXAMINER_FIRST_AID',
  'EXAMINER_BRONZE',
  'NL_INSTRUCTOR',
  'FIRST_AID_INSTRUCTOR',
  'BRONZE_INSTRUCTOR',
  'SWIM_INSTRUCTOR'
];

function randomCerts() {
  const count = Math.floor(Math.random() * 4) + 1;
  const shuffled = certTypes.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(type => ({
    type,
    years: Math.floor(Math.random() * 10) + 1
  }));
}

// Paths to gender-specific image folders
const DUMMY_IMG_DIR = {
  male: path.resolve('../backend/uploads/dummyaccounts/male'),
  female: path.resolve('../backend/uploads/dummyaccounts/female')
};

// Read image files from both folders
const imgFiles = {
  male: fs.readdirSync(DUMMY_IMG_DIR.male).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f)),
  female: fs.readdirSync(DUMMY_IMG_DIR.female).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f))
};

// Verify we have enough unique images
Object.entries(genderCounts).forEach(([gender, count]) => {
  if (imgFiles[gender].length < count) {
    throw new Error(`Not enough unique ${gender} profile pictures. Need ${count} but only found ${imgFiles[gender].length}`);
  }
});

// Keep track of used images
const usedImages = {
  male: new Set(),
  female: new Set()
};

async function upsertUsers() {
  await mongoose.connect(MONGO_URI);

  for (let i = 0; i < randomNames.length; i++) {
    const { firstName, lastName, gender } = randomNames[i];
    const certifications = randomCerts();
    const role = mentorIndices.includes(i) ? 'MENTOR' : 'USER';
    
    // Get the next unused image for this gender
    const availableImages = imgFiles[gender].filter(img => !usedImages[gender].has(img));
    if (availableImages.length === 0) {
      throw new Error(`Ran out of unique ${gender} profile pictures`);
    }
    const imgFile = availableImages[0];
    usedImages[gender].add(imgFile);
    
    const avatarUrl = `/uploads/dummyaccounts/${gender}/${imgFile}`;
    const email = `dummy.${firstName.toLowerCase()}.${lastName.toLowerCase()}@mentorconnect.test`;
    
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          firstName,
          lastName,
          email,
          avatarUrl,
          role,
          certifications,
          isDummy: true,
          dummyBatch: 'carousel-test-2024-07',
          gender
        }
      },
      { upsert: true, new: true }
    );
  }

  await mongoose.disconnect();
  console.log('Dummy carousel users upserted!');
}

upsertUsers(); 