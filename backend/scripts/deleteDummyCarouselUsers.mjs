// scripts/deleteDummyCarouselUsers.mjs
// Run this script with: npx tsx scripts/deleteDummyCarouselUsers.mjs
import mongoose from 'mongoose';
import { User } from '../src/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/mentorconnect';

async function deleteDummyUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Delete all users with dummy email addresses OR no email
    const result = await User.deleteMany({
      $or: [
        { email: { $regex: /^dummy\..*@mentorconnect\.test$/ } },
        { email: { $exists: false } },
        { email: null }
      ]
    });
    
    
  } catch (error) {
    console.error('Error deleting dummy users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

deleteDummyUsers(); 