import { Request, Response } from 'express';
import { User } from '../models/user.js';

const ALLOWED_PREP_REQUIREMENTS = [
  'lesson-plan',
  'exam-plan',
  'scenarios',
  'must-sees',
  'full-apprentice',
  'exam-only',
];

export async function updateNoticeDays(req: Request, res: Response) {
  try {
    const userId = req.user?._id || req.user?.id; // depends on your auth middleware
    const { preferredNoticeDays } = req.body;
    const days = Number(preferredNoticeDays);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      return res.status(400).json({ error: 'preferredNoticeDays must be an integer between 1 and 90.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { preferredNoticeDays: days },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ preferredNoticeDays: user.preferredNoticeDays });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updatePrepRequirements(req: Request, res: Response) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { prepRequirements } = req.body;
    if (!Array.isArray(prepRequirements) || !prepRequirements.every(val => ALLOWED_PREP_REQUIREMENTS.includes(val))) {
      return res.status(400).json({ error: 'Invalid prep requirements.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { prepRequirements },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ prepRequirements: user.prepRequirements });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateExpectedInvolvement(req: Request, res: Response) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { expectedMenteeInvolvement } = req.body;
    if (!['', 'full-course', 'exam-only'].includes(expectedMenteeInvolvement)) {
      return res.status(400).json({ error: 'Invalid expected mentee involvement.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { expectedMenteeInvolvement },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ expectedMenteeInvolvement: user.expectedMenteeInvolvement });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updatePrepSupportFee(req: Request, res: Response) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { prepSupportFee, feeCurrency } = req.body;
    const fee = Number(prepSupportFee);
    if (isNaN(fee) || fee < 0) {
      return res.status(400).json({ error: 'prepSupportFee must be a number ≥ 0.' });
    }
    if (typeof feeCurrency !== 'string' || !/^[A-Z]{3}$/.test(feeCurrency)) {
      return res.status(400).json({ error: 'feeCurrency must be a 3-letter ISO code.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { prepSupportFee: fee, feeCurrency },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ prepSupportFee: user.prepSupportFee, feeCurrency: user.feeCurrency });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}

export async function updateCancellationWindow(req: Request, res: Response) {
  try {
    const userId = req.user?._id || req.user?.id;
    const { cancellationPolicyHours } = req.body;
    const hours = Number(cancellationPolicyHours);
    if (!Number.isInteger(hours) || hours < 1 || hours > 168) {
      return res.status(400).json({ error: 'cancellationPolicyHours must be an integer between 1 and 168.' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { cancellationPolicyHours: hours },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ cancellationPolicyHours: user.cancellationPolicyHours });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
} 