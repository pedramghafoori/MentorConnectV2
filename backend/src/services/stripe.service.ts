import Stripe from 'stripe';
import { User } from '../models/user.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export class StripeService {
  static async createOAuthLink(userId: string, state: string): Promise<string> {
    try {
      // Check if user already has a Stripe account
      let user = await User.findById(userId);
      let stripeAccountId = user?.stripeAccountId;

      // If not, create a new Stripe account and save it
      if (!stripeAccountId) {
        const account = await stripe.accounts.create({
          type: 'standard',
          email: user?.email,
          metadata: {
            userId: userId
          }
        });
        stripeAccountId = account.id;
        console.log('Saving stripeAccountId:', stripeAccountId, 'to user:', userId);
        const updatedUser = await User.findByIdAndUpdate(userId, { stripeAccountId }, { new: true });
        console.log('Updated user after adding Stripe account ID:', updatedUser);
      }

      // Create an account link for onboarding using the Stripe account ID
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: 'http://localhost:5173/settings',
        return_url: 'http://localhost:5173/settings',
        type: 'account_onboarding',
        collect: 'eventually_due',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error creating Stripe OAuth link:', error);
      throw error;
    }
  }

  static async handleOAuthCallback(code: string): Promise<string> {
    console.log('[StripeService] Handling OAuth callback with code:', code ? 'present' : 'missing');
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });
    console.log('[StripeService] OAuth token response:', {
      hasStripeUserId: !!response.stripe_user_id,
      accountId: response.stripe_user_id
    });

    if (!response.stripe_user_id) {
      console.error('[StripeService] No Stripe user ID in response');
      throw new Error('Failed to get Stripe user ID');
    }

    return response.stripe_user_id;
  }

  static async updateUserStripeAccount(userId: string, stripeAccountId: string): Promise<void> {
    console.log('[StripeService] Updating user', userId, 'with Stripe account ID:', stripeAccountId);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { stripeAccountId },
      { new: true }
    );
    console.log('[StripeService] User update result:', {
      success: !!updatedUser,
      hasStripeAccountId: !!updatedUser?.stripeAccountId,
      stripeAccountId: updatedUser?.stripeAccountId
    });
  }

  static async createPaymentIntent({
    amount,
    currency,
    capture_method,
    metadata
  }: {
    amount: number;
    currency: string;
    capture_method: 'automatic' | 'manual';
    metadata: Record<string, string>;
  }): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount,
      currency,
      capture_method,
      metadata
    });
  }

  static async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.capture(paymentIntentId);
  }

  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.cancel(paymentIntentId);
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.retrieve(paymentIntentId);
  }
} 