import { Router } from 'express';
import { Opportunity } from '../models/opportunity.js';
import { authenticateToken } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = Router();

// GET /api/opportunities - Get all or filter by city
router.get('/', async (req, res) => {
  try {
    const { city, organization, mentor, deletedSince } = req.query;
    let filter: any = {};
    if (mentor) {
      filter.mentor = mentor;
    }
    if (deletedSince) {
      // Fetch recently deleted for this mentor
      filter.deletedAt = { $ne: null, $gte: new Date(deletedSince as string) };
    } else {
      filter.deletedAt = null;
      if (city) {
        filter.city = city;
      }
      if (organization) {
        filter['organization.name'] = new RegExp(organization as string, 'i');
      }
    }
    const opportunities = await Opportunity.find(filter)
      .populate('facility')
      .populate({
        path: 'mentor',
        select: 'firstName lastName avatarUrl certifications',
      });

    // Calculate yearsOfExperience for each mentor (max years from certifications)
    const opportunitiesWithExperience = opportunities.map(oppDoc => {
      const opp = oppDoc.toObject();
      // Only proceed if mentor is a plain object (not ObjectId)
      if (
        opp.mentor &&
        typeof opp.mentor === 'object' &&
        opp.mentor !== null &&
        !Array.isArray(opp.mentor) &&
        Object.prototype.hasOwnProperty.call(opp.mentor, 'certifications')
      ) {
        const mentor: any = opp.mentor;
        if (Array.isArray(mentor.certifications) && mentor.certifications.length > 0) {
          const maxYears = Math.max(...mentor.certifications.map((cert: any) => cert.years || 0));
          mentor.yearsOfExperience = maxYears;
        } else {
          mentor.yearsOfExperience = 0;
        }
      }
      return opp;
    });

    res.json(opportunitiesWithExperience);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching opportunities', error });
  }
});

// GET /api/opportunities/organizations - Get unique organizations
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Opportunity.aggregate([
      { $match: { 'organization.name': { $exists: true, $ne: null } } },
      { $group: { _id: '$organization.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error });
  }
});

// POST /api/opportunities - Create a new opportunity
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can post opportunities.' });
    }
    // Destructure all relevant fields from the request body
    const {
      title,
      description,
      city,
      price,
      organization,
      facility,
      status,
      notes,
      schedule,
      prepRequirements,
      createdAt
    } = req.body;
    const opportunity = new Opportunity({
      title,
      description,
      city,
      price,
      organization,
      facility,
      status,
      notes,
      schedule,
      prepRequirements,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      mentor: req.user.userId
    });
    await opportunity.save();
    // Populate mentor and facility for consistency
    await opportunity.populate([
      { path: 'mentor', select: 'firstName lastName avatarUrl certifications' },
      { path: 'facility' }
    ]);
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: 'Error creating opportunity', error });
  }
});

// PATCH /api/opportunities/:id - Update an opportunity by ID
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedOpportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json(updatedOpportunity);
  } catch (error) {
    res.status(500).json({ message: 'Error updating opportunity', error });
  }
});

// Soft delete endpoint
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOpportunity = await Opportunity.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!updatedOpportunity) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json(updatedOpportunity);
  } catch (error) {
    res.status(500).json({ message: 'Error soft deleting opportunity', error });
  }
});

export default router; 