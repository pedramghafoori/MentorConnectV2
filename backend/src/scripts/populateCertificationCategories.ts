import mongoose from 'mongoose';
import { CertificationCategory, initialCertificationCategories } from '../models/certificationCategory.js';
import dotenv from 'dotenv';

dotenv.config();

async function populateCertificationCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await CertificationCategory.deleteMany({});
    console.log('Cleared existing certification categories');

    // Insert new categories
    await CertificationCategory.insertMany(initialCertificationCategories);
    console.log('Successfully populated certification categories');

    // Verify the data
    const count = await CertificationCategory.countDocuments();
    console.log(`Total certification categories: ${count}`);

    // Log the hierarchy
    const categories = await CertificationCategory.find().sort({ level: -1 });
    console.log('\nCertification Hierarchy:');
    categories.forEach(cat => {
      console.log(`Level ${cat.level} (${cat.category}): ${cat.name}`);
    });

  } catch (error) {
    console.error('Error populating certification categories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateCertificationCategories(); 