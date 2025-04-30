import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';
import { Review } from '../models/review.js';

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

// PATCH /api/users/me - Update current user's profile (e.g., avatarUrl)
router.patch('/me', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// GET /api/users/:userId/reviews - Get paginated reviews for a user
router.get('/:userId/reviews', authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;

  try {
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Review.countDocuments({ user: userId });
    const nextPage = page * limit < total ? page + 1 : null;

    res.json({
      reviews,
      nextPage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
});

// GET /api/users/search - Search users by name or LSS ID
router.get('/search', async (req, res) => {
  const query = req.query.query?.toString().trim();
  if (!query) return res.json([]);
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { lssId: { $regex: query, $options: 'i' } }
      ]
    }).select('firstName lastName avatarUrl lssId role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error });
  }
});

export default router; 