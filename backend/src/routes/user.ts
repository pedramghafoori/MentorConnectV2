import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';

const router = Router();

router.post('/:id/sign-mentor-agreement', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user.userId !== id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { mentorAgreementSigned: true }, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Mentor agreement signed successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error signing mentor agreement', error });
  }
});

router.get('/:id/profile', authenticateToken, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user.userId !== id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ ...user.toObject(), mentorAgreementSigned: user.mentorAgreementSigned });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

export default router; 