import mongoose, { Document, Model, Schema } from 'mongoose';
import { Course } from './course.js';

export interface ICourseType extends Document {
  name: string;
  description?: string;
}

export interface CourseTypeModel extends Model<ICourseType> {
  calculateFeeRange(typeName: string): Promise<{ min: number; max: number }>;
}

const courseTypeSchema = new Schema<ICourseType, CourseTypeModel>({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

// Static method to compute the historical fee range for a given course type
courseTypeSchema.statics.calculateFeeRange = async function(typeName: string) {
  // Aggregate to find raw historic min and max prices for this type
  const result = await Course.aggregate([
    { $match: { title: typeName } },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  if (result.length > 0) {
    // Clamp minimum price to at least $50
    const rawMin = result[0].minPrice;
    let min = rawMin < 50 ? 50 : rawMin;
    // Use raw max or clamp up to ensure at least $25 difference
    const rawMax = result[0].maxPrice;
    let max = rawMax;
    if (max - min < 25) {
      max = min + 25;
    }
    return { min, max };
  }
  // No history: default minimum to $50, maximum to $75 (25 difference)
  return { min: 50, max: 75 };
};

// Export the CourseType model
export const CourseType = mongoose.model<ICourseType, CourseTypeModel>('CourseType', courseTypeSchema); 