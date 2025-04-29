import { Router } from 'express';
import { register, login, refreshToken, logout, forgotPassword, resetPassword } from '../controllers/auth.js';
import { authenticateToken } from '../middleware/auth.js';

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

// Current user route
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

export default router; 