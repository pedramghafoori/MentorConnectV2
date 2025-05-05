import mongoose from 'mongoose';
import { Opportunity } from '../src/models/opportunity';

async function generateUniqueOpid(): Promise<string> {
  while (true) {
    const randomNum = Math.floor(Math.random() * 100000);
    const opid = `OPID-${String(randomNum).padStart(5, '0')}`;
    const exists = await Opportunity.exists({ opid });
    if (!exists) return opid;
  }
}

async function backfillOpids() {
  try {
    // Replace this with your MongoDB Atlas connection string
    const MONGODB_URI = 'mongodb+srv://pedramghafoori:3PASQgC3htAn1Lfv@mentorconnectcluster.vs7jp6j.mongodb.net/mentorconnect?retryWrites=true&w=majority&appName=MentorConnectCluster';
    
    await mongoose.connect(MONGODB_URI);

    // Find all opportunities missing opid
    const missing = await Opportunity.find({ $or: [{ opid: { $exists: false } }, { opid: null }] });
    console.log(`Found ${missing.length} opportunities missing opid`);

    for (const opp of missing) {
      opp.opid = await generateUniqueOpid();
      await opp.save();
      console.log(`Updated ${opp._id} with opid ${opp.opid}`);
    }

    console.log('Backfill complete!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during backfill:', err);
    process.exit(1);
  }
}

backfillOpids(); 