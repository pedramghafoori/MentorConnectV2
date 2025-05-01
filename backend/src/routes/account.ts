import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';

const router = Router();

// DELETE /api/account - Soft-delete the current user's account
router.delete('/', authenticateToken, async (req, res) => {
  const userId = req.user?.userId;
  const { password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ message: 'Password required.' });
  }
  try {
    const user = await User.findOne({ _id: userId, deletedAt: null });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password.' });
    const now = new Date();
    user.deletionRequestedAt = now;
    user.deletedAt = now;
    await user.save();
    // TODO: Invalidate all refresh tokens/sessions for this user
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error });
  }
});

export default router; 