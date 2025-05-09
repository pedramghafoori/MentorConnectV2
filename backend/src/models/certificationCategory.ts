import mongoose from 'mongoose';

// Define the schema for certification categories
const certificationCategorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'FIRST_AID_INSTRUCTOR',
      'LIFESAVING_INSTRUCTOR',
      'NL_INSTRUCTOR',
      'EXAMINER_FIRST_AID',
      'EXAMINER_NL',
      'EXAMINER_BRONZE',
      'INSTRUCTOR_TRAINER_LIFESAVING',
      'INSTRUCTOR_TRAINER_NL',
      'INSTRUCTOR_TRAINER_FIRST_AID',
      'INSTRUCTOR_TRAINER_SWIM'
    ]
  },
  name: {
    type: String,
    required: true
  },
  validAwards: [{
    type: String,
    required: true
  }],
  level: {
    type: Number,
    required: true,
    enum: [1, 2, 3], // 1 = Instructor, 2 = Examiner, 3 = Instructor Trainer
  },
  category: {
    type: String,
    required: true,
    enum: ['INSTRUCTOR', 'EXAMINER', 'INSTRUCTOR_TRAINER']
  }
});

// Create indexes for efficient querying
certificationCategorySchema.index({ level: 1 });
certificationCategorySchema.index({ category: 1 });

// Create the model
export const CertificationCategory = mongoose.model('CertificationCategory', certificationCategorySchema);

// Initial data to populate the database
export const initialCertificationCategories = [
  {
    code: 'FIRST_AID_INSTRUCTOR',
    name: 'First Aid Instructor',
    validAwards: ['Standard First Aid Instructor', 'Emergency First Aid Instructor'],
    level: 1,
    category: 'INSTRUCTOR'
  },
  {
    code: 'LIFESAVING_INSTRUCTOR',
    name: 'Lifesaving Instructor',
    validAwards: ['Lifesaving Instructor', 'Swim Instructor'],
    level: 1,
    category: 'INSTRUCTOR'
  },
  {
    code: 'NL_INSTRUCTOR',
    name: 'National Lifeguard Instructor',
    validAwards: ['National Lifeguard Instructor'],
    level: 1,
    category: 'INSTRUCTOR'
  },
  {
    code: 'EXAMINER_FIRST_AID',
    name: 'First Aid Examiner',
    validAwards: ['Examiner - Standard First Aid'],
    level: 2,
    category: 'EXAMINER'
  },
  {
    code: 'EXAMINER_NL',
    name: 'National Lifeguard Examiner',
    validAwards: ['Examiner - National Lifeguard'],
    level: 2,
    category: 'EXAMINER'
  },
  {
    code: 'EXAMINER_BRONZE',
    name: 'Bronze Examiner',
    validAwards: ['Examiner - Bronze Cross'],
    level: 2,
    category: 'EXAMINER'
  },
  {
    code: 'INSTRUCTOR_TRAINER_LIFESAVING',
    name: 'Lifesaving Instructor Trainer',
    validAwards: ['Instructor Trainer - Lifesaving'],
    level: 3,
    category: 'INSTRUCTOR_TRAINER'
  },
  {
    code: 'INSTRUCTOR_TRAINER_NL',
    name: 'National Lifeguard Instructor Trainer',
    validAwards: ['Instructor Trainer - National Lifeguard'],
    level: 3,
    category: 'INSTRUCTOR_TRAINER'
  },
  {
    code: 'INSTRUCTOR_TRAINER_FIRST_AID',
    name: 'First Aid Instructor Trainer',
    validAwards: ['Instructor Trainer - Standard First Aid'],
    level: 3,
    category: 'INSTRUCTOR_TRAINER'
  },
  {
    code: 'INSTRUCTOR_TRAINER_SWIM',
    name: 'Swim Instructor Trainer',
    validAwards: ['Instructor Trainer - Swim'],
    level: 3,
    category: 'INSTRUCTOR_TRAINER'
  }
]; 