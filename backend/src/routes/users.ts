import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';

const router = Router();

// GET /api/users/me - Get current user's profile
router.get('/me', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router; 