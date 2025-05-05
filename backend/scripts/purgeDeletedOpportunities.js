import mongoose from 'mongoose';
import { Opportunity } from '../src/models/opportunity.js';

// Connect to your MongoDB (update the URI as needed)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorconnect');

async function purgeOldDeletedOpportunities() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await Opportunity.deleteMany({ deletedAt: { $lte: cutoff } });
  console.log(`Purged ${result.deletedCount} opportunities.`);
  mongoose.disconnect();
}

purgeOldDeletedOpportunities(); 