// scripts/listAllUsers.mjs
// Run this script with: npx tsx scripts/listAllUsers.mjs
import mongoose from 'mongoose';
import { User } from '../src/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/mentorconnect';

async function listAllUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    
    // Find all users
    const users = await User.find({});
    
    
    users.forEach(user => {
      console.log('\nUser:', {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isDummy: user.isDummy,
        dummyBatch: user.dummyBatch,
        role: user.role,
        certifications: user.certifications,
        // Show all fields that exist
        allFields: Object.keys(user.toObject())
      });
    });
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listAllUsers(); 