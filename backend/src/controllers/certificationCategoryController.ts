import { Request, Response } from 'express';
import { CertificationCategory } from '../models/certificationCategory.js';

// Get all certification categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CertificationCategory.find().sort({ level: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certification categories' });
  }
};

// Get certification categories by level
export const getCategoriesByLevel = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;
    const categories = await CertificationCategory.find({ level: parseInt(level) });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certification categories by level' });
  }
};

// Get certification categories by category type
export const getCategoriesByType = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const categories = await CertificationCategory.find({ category });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certification categories by type' });
  }
};

// Get certification hierarchy
export const getCertificationHierarchy = async (req: Request, res: Response) => {
  try {
    const hierarchy = await CertificationCategory.aggregate([
      {
        $group: {
          _id: '$category',
          categories: {
            $push: {
              code: '$code',
              name: '$name',
              level: '$level',
              validAwards: '$validAwards'
            }
          }
        }
      },
      {
        $sort: {
          '_id': 1
        }
      }
    ]);
    res.json(hierarchy);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certification hierarchy' });
  }
};

// Get certification by code
export const getCategoryByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const category = await CertificationCategory.findOne({ code });
    if (!category) {
      return res.status(404).json({ error: 'Certification category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching certification category' });
  }
}; 