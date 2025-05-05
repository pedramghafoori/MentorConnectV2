import { Router } from 'express';
import { Facility } from '../models/facility.js';

const router = Router();

// GET /api/facilities?search=...&city=...&organization=...
router.get('/', async (req, res) => {
  try {
    const { search, city, organization } = req.query;
    let filter: any = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { name: regex },
        { organization: regex },
        { address: regex },
        { city: regex }
      ];
    }
    if (city) {
      filter.city = city;
    }
    if (organization) {
      filter.organization = organization;
    }
    const facilities = await Facility.find(filter).limit(10);
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching facilities', error });
  }
});

// POST /api/facilities
router.post('/', async (req, res) => {
  try {
    const { name, organization, address, city } = req.body;
    if (!name || !organization || !address || !city) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const facility = new Facility({ name, organization, address, city });
    await facility.save();
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ message: 'Error creating facility', error });
  }
});

export default router; 