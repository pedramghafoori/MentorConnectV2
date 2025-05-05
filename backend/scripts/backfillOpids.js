import mongoose from 'mongoose';
import { Opportunity } from '../src/models/opportunity.js';

async function generateUniqueOpid() {
  let opid;
  let exists = true;
  while (exists) {
    const randomNum = Math.floor(Math.random() * 100000);
    opid = `OPID-${String(randomNum).padStart(5, '0')}`;
    exists = await Opportunity.exists({ opid });
  }
  return opid;
}

async function backfillOpids() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorconnect');

  // Find all opportunities missing opid
  const missing = await Opportunity.find({ $or: [{ opid: { $exists: false } }, { opid: null }] });

  for (const opp of missing) {
    opp.opid = await generateUniqueOpid();
    await opp.save();
    console.log(`Updated ${opp._id} with opid ${opp.opid}`);
  }

  console.log('Backfill complete!');
  mongoose.disconnect();
}

backfillOpids(); 