import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CourseType } from '../models/courseType.js';

dotenv.config();

async function seedCourseTypes() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorconnect';
  await mongoose.connect(uri);

  const types = [
    { name: 'Bronze', description: 'Bronze level course' },
    { name: 'Standard First Aid', description: 'Standard First Aid course' },
    { name: 'National Lifeguard', description: 'National Lifeguard certification' },
    { name: 'Lifesaving IT', description: 'Life Saving Instructor Training' },
    { name: 'First Aid IT', description: 'First Aid Instructor Training' },
    { name: 'NL IT', description: 'National Lifeguard Instructor Training' }
  ];

  for (const type of types) {
    await CourseType.updateOne(
      { name: type.name },
      { $set: { description: type.description } },
      { upsert: true }
    );
    console.log(`Upserted course type: ${type.name}`);
  }

  console.log('Course types seeding complete.');
  await mongoose.disconnect();
}

seedCourseTypes().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
}); 