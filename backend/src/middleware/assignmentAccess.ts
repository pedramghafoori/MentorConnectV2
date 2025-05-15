import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/assignment.js';

export const checkAssignmentAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Admin users have access to all assignments
    if (userRole === 'ADMIN') {
      return next();
    }

    // Check if user is either the mentor or mentee of the assignment
    if (assignment.mentorId.toString() === userId || assignment.menteeId.toString() === userId) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Error in checkAssignmentAccess:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 