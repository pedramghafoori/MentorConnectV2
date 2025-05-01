import { Router } from 'express';
import { register, login, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/email.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Registration and login routes
router.post('/register', register);
router.post('/login', login);

// Token management routes
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Password management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Request password reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: 'If an account exists, you will receive a reset email.' });
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    text: `Reset your password: ${resetUrl}`
  });
  res.status(200).json({ message: 'If an account exists, you will receive a reset email.' });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });
  user.password = await bcrypt.hash(newPassword, '10');
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.status(200).json({ message: 'Password has been reset.' });
});

// Current user route
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router; 