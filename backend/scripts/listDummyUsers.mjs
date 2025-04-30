// scripts/listDummyUsers.mjs
// Run this script with: npx tsx scripts/listDummyUsers.mjs
import mongoose from 'mongoose';
import { User } from '../src/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/mentorconnect';

async function listDummyUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Find all users that might be dummy users
    const users = await User.find({
      $or: [
        { isDummy: true },
        { dummyBatch: 'carousel-test-2024-07' }
      ]
    });
    
    console.log(`Found ${users.length} potential dummy users:`);
    users.forEach(user => {
      console.log('\nUser:', {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isDummy: user.isDummy,
        dummyBatch: user.dummyBatch,
        role: user.role,
        certifications: user.certifications
      });
    });
  } catch (error) {
    console.error('Error listing dummy users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listDummyUsers(); 