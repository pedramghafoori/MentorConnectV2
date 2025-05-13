import { Request, Response } from 'express';
import { Assignment } from '../models/assignment.js';

export const listMentorAssignments = async (req: Request, res: Response) => {
  try {
    const { range } = req.query;
    const mentorId = req.user?.userId;

    console.log('=== ListMentorAssignments Request ===');
    console.log('Request details:', {
      range,
      mentorId,
      user: req.user,
      headers: req.headers,
      cookies: req.cookies
    });

    // Debug: Check all assignments for this mentor
    const allAssignments = await Assignment.find({ mentorId });
    console.log('Debug - All assignments for mentor:', {
      total: allAssignments.length,
      assignments: allAssignments.map(a => ({
        id: a._id,
        status: a.status,
        startDate: a.startDate,
        menteeId: a.menteeId
      }))
    });

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    console.log('Date ranges:', {
      today: today.toISOString(),
      nextMonth: nextMonth.toISOString()
    });

    const filter: any = { mentorId };
    console.log('Initial filter:', filter);

    switch (range) {
      case 'future':
        filter.startDate = { $gt: nextMonth };
        console.log('Future filter applied:', filter);
        break;
      case 'active':
        filter.status = { $in: ['ACTIVE', 'CHARGED', 'PENDING', 'ACCEPTED'] };
        console.log('Active filter applied:', filter);
        break;
      case 'completed':
        filter.status = { $in: ['COMPLETED', 'REJECTED', 'CANCELED'] };
        console.log('Completed filter applied:', filter);
        break;
      default:
        // Show all assignments except completed ones
        filter.status = { $nin: ['COMPLETED', 'REJECTED', 'CANCELED'] };
        console.log('Default filter applied:', filter);
    }

    console.log('Final MongoDB filter:', JSON.stringify(filter, null, 2));

    const list = await Assignment
      .find(filter)
      .populate('menteeId', 'firstName lastName avatarUrl')
      .sort({ startDate: 1 });

    console.log('Query results:', {
      totalFound: list.length,
      assignments: list.map(a => ({
        id: a._id,
        status: a.status,
        startDate: a.startDate,
        menteeId: a.menteeId
      }))
    });

    res.json(list);
  } catch (error: any) {
    console.error('Error in listMentorAssignments:', error);
    console.error('Error stack:', error.stack);
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