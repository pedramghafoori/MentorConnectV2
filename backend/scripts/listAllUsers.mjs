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
      
    });
  } catch (error) {
    
  } finally {
    await mongoose.disconnect();
  }
}

listAllUsers(); 