import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { StripeService } from '../services/stripe.service.js';
import { User } from '../models/user.js';

const router = express.Router();

// Create OAuth link for Stripe Connect
router.post('/create-oauth-link', authenticateToken, async (req, res) => {
  try {
    console.log('req.user:', req.user);
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ message: 'Only mentors can enable payouts' });
    }

    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ message: 'State parameter is required' });
    }

    const link = await StripeService.createOAuthLink(req.user.userId, state);
    res.json({ url: link });
  } catch (error) {
    console.error('Error creating Stripe OAuth link:', error);
    res.status(500).json({ message: 'Failed to create OAuth link' });
  }
});

// Handle Stripe OAuth callback
router.get('/oauth/callback', authenticateToken, async (req, res) => {
  try {
    const { code, state } = req.query;
    console.log('[Stripe OAuth] Callback received:', { 
      code: code ? 'present' : 'missing', 
      state: state ? 'present' : 'missing',
      userId: req.user?.userId,
      userRole: req.user?.role
    });

    if (!req.user) {
      console.error('[Stripe OAuth] No authenticated user found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!code || !state) {
      console.error('[Stripe OAuth] Missing parameters:', { code, state });
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Verify state matches the logged-in user
    if (state !== req.user.userId) {
      console.error('[Stripe OAuth] State mismatch:', { 
        receivedState: state, 
        expectedState: req.user.userId 
      });
      return res.status(403).json({ message: 'Invalid state parameter' });
    }

    // Exchange code for Stripe account ID
    console.log('[Stripe OAuth] Exchanging code for Stripe account ID...');
    const stripeAccountId = await StripeService.handleOAuthCallback(code as string);
    console.log('[Stripe OAuth] Received Stripe account ID:', stripeAccountId);

    // Update user with Stripe account ID
    console.log('[Stripe OAuth] Updating user with Stripe account ID...');
    await StripeService.updateUserStripeAccount(req.user.userId, stripeAccountId);
    console.log('[Stripe OAuth] User updated successfully');

    // Redirect back to frontend settings with success message
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    console.log('[Stripe OAuth] Redirecting to:', `${frontendUrl}/settings?success=true`);
    res.redirect(`${frontendUrl}/settings?success=true`);
  } catch (error) {
    console.error('[Stripe OAuth] Error handling callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/settings?error=Failed to connect Stripe account`);
  }
});

export default router; 