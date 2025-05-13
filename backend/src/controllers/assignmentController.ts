import { Request, Response } from 'express';
import { Assignment } from '../models/assignment.js';

export const listMentorAssignments = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const mentorId = req.user?.userId;

    console.log('ListMentorAssignments called with:', {
      range,
      mentorId,
      user: req.user
    });

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const filter: any = { mentorId };
    switch (range) {
      case 'future':
        filter.startDate = { $gt: nextMonth };
        break;
      case 'active':
        filter.status = 'ACTIVE';
        break;
      case 'completed':
        filter.status = 'COMPLETED';
        break;
      default:
        filter.status = { $ne: 'COMPLETED' };
    }

    console.log('MongoDB filter:', filter);

    const list = await Assignment
      .find(filter)
      .populate('menteeId', 'firstName lastName avatarUrl')
      .sort({ startDate: 1 });

    console.log('Found assignments:', list.length);

    res.json(list);
  } catch (error) {
    console.error('Error in listMentorAssignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const doc = await Assignment
      .findOne({ _id: req.params.id, mentorId: req.user?.userId })
      .populate([
        { path: 'menteeId', select: 'firstName lastName avatarUrl email' },
        { path: 'opportunityId' }
      ]);

    if (!doc) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(doc);
  } catch (error) {
    console.error('Error in getAssignmentById:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
}; 