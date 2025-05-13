import { Assignment, IAssignment } from '../models/assignment.js';
import { Opportunity } from '../models/opportunity.js';
import { User } from '../models/user.js';
import { StripeService } from './stripe.service.js';
import { NotificationService } from './notification.service.js';
import mongoose from 'mongoose';
import { Notification } from '../models/notification.js';

export class AssignmentService {
  static async createAssignment(data: {
    menteeId: string;
    opportunityId: string;
    feeSnapshot: number;
    prerequisites: {
      verified: boolean;
      method: 'scraper' | 'ama';
      verifiedAt?: Date;
      signedAt?: Date;
    };
    agreements: {
      menteeSignature: string;
      amaSignature?: string;
    };
    paymentIntentId?: string;
  }): Promise<IAssignment> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if opportunity exists and is available
      const opportunity = await Opportunity.findById(data.opportunityId).populate('facility');
      if (!opportunity) {
        throw new Error('Opportunity not found');
      }

      if (!opportunity.mentor) {
        throw new Error('Opportunity has no mentor assigned');
      }

      // Check if mentee exists
      const mentee = await User.findById(data.menteeId);
      if (!mentee) {
        throw new Error('Mentee not found');
      }

      // Create payment intent if there's a fee
      let paymentIntentId = data.paymentIntentId;
      if (data.feeSnapshot > 0 && !paymentIntentId) {
        const intent = await StripeService.createPaymentIntent({
          amount: data.feeSnapshot * 100, // Convert to cents
          currency: 'cad',
          capture_method: 'manual',
          metadata: {
            opportunityId: data.opportunityId,
            menteeId: data.menteeId
          }
        });
        paymentIntentId = intent.id;
      }

      // Create assignment
      const assignment = await Assignment.create([{
        ...data,
        paymentIntentId,
        status: 'PENDING',
        mentorId: opportunity.mentor
      }], { session });

      // Send notification to mentor
      await NotificationService.send({
        userId: opportunity.mentor.toString(),
        type: 'MENTOR_APPLICATION_RECEIVED',
        data: {
          assignmentId: assignment[0]._id,
          menteeName: `${mentee.firstName} ${mentee.lastName}`,
          menteeId: mentee._id,
          menteeAvatarUrl: mentee.avatarUrl || null,
          opportunityTitle: opportunity.title,
          opportunityDate: opportunity.schedule?.isExamOnly
            ? opportunity.schedule.examDate
            : (opportunity.schedule?.courseDates?.[0] || null),
          opportunityLocation:
            (opportunity.facility && typeof opportunity.facility === 'object' && 'name' in opportunity.facility)
              ? `${(opportunity.facility as any).name}${(opportunity.facility as any).address ? ', ' + (opportunity.facility as any).address : ''}`
              : (opportunity.city || 'N/A'),
          opportunityPrice: opportunity.price || 0,
          assignmentStatus: assignment[0].status
        }
      });

      await session.commitTransaction();
      return assignment[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async acceptAssignment(assignmentId: string): Promise<IAssignment> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('[acceptAssignment] assignmentId:', assignmentId);
      const assignment = await Assignment.findById(assignmentId);
      console.log('[acceptAssignment] found assignment:', assignment);
      if (!assignment) {
        console.error('[acceptAssignment] Assignment not found');
        throw new Error('Assignment not found');
      }

      if (assignment.status !== 'PENDING') {
        console.error('[acceptAssignment] Assignment is not in PENDING state:', assignment.status);
        throw new Error('Assignment is not in PENDING state');
      }

      // Capture payment if there's a payment intent
      if (assignment.paymentIntentId) {
        try {
          console.log('[acceptAssignment] Capturing paymentIntent:', assignment.paymentIntentId);
          await StripeService.capturePaymentIntent(assignment.paymentIntentId);
        } catch (stripeError) {
          console.error('[acceptAssignment] Error capturing paymentIntent:', stripeError);
          throw stripeError;
        }
      }

      // Update assignment status
      assignment.status = 'CHARGED';
      await assignment.save({ session });

      // Update opportunity with mentee
      await Opportunity.findByIdAndUpdate(
        assignment.opportunityId,
        { mentee: assignment.menteeId },
        { session }
      );

      // Update mentor's notification assignmentStatus
      await Notification.updateMany(
        {
          'data.assignmentId': assignment._id,
          type: 'MENTOR_APPLICATION_RECEIVED'
        },
        { $set: { 'data.assignmentStatus': assignment.status } }
      );

      // Send notification to mentee
      const opportunity = await Opportunity.findById(assignment.opportunityId);
      const mentor = opportunity ? await User.findById(opportunity.mentor) : null;
      await NotificationService.send({
        userId: assignment.menteeId.toString(),
        type: 'APPLICATION_ACCEPTED',
        data: {
          assignmentId: assignment._id,
          opportunityId: assignment.opportunityId,
          assignmentStatus: assignment.status,
          mentorAvatarUrl: mentor?.avatarUrl || null
        }
      });

      await session.commitTransaction();
      return assignment;
    } catch (error) {
      await session.abortTransaction();
      console.error('[acceptAssignment] Error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async rejectAssignment(assignmentId: string): Promise<IAssignment> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log('[rejectAssignment] assignmentId:', assignmentId);
      const assignment = await Assignment.findById(assignmentId);
      console.log('[rejectAssignment] found assignment:', assignment);
      if (!assignment) {
        console.error('[rejectAssignment] Assignment not found');
        throw new Error('Assignment not found');
      }

      if (assignment.status !== 'PENDING') {
        console.error('[rejectAssignment] Assignment is not in PENDING state:', assignment.status);
        throw new Error('Assignment is not in PENDING state');
      }

      // Cancel payment intent if exists
      if (assignment.paymentIntentId) {
        try {
          console.log('[rejectAssignment] Canceling paymentIntent:', assignment.paymentIntentId);
          await StripeService.cancelPaymentIntent(assignment.paymentIntentId);
        } catch (stripeError) {
          console.error('[rejectAssignment] Error canceling paymentIntent:', stripeError);
          throw stripeError;
        }
      }

      // Update assignment status
      assignment.status = 'REJECTED';
      await assignment.save({ session });

      // Update mentor's notification assignmentStatus
      await Notification.updateMany(
        {
          'data.assignmentId': assignment._id,
          type: 'MENTOR_APPLICATION_RECEIVED'
        },
        { $set: { 'data.assignmentStatus': assignment.status } }
      );

      // Send notification to mentee
      const opportunity = await Opportunity.findById(assignment.opportunityId);
      const mentor = opportunity ? await User.findById(opportunity.mentor) : null;
      await NotificationService.send({
        userId: assignment.menteeId.toString(),
        type: 'APPLICATION_REJECTED',
        data: {
          assignmentId: assignment._id,
          opportunityId: assignment.opportunityId,
          assignmentStatus: assignment.status,
          mentorAvatarUrl: mentor?.avatarUrl || null
        }
      });

      await session.commitTransaction();
      return assignment;
    } catch (error) {
      await session.abortTransaction();
      console.error('[rejectAssignment] Error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelAssignment(assignmentId: string): Promise<IAssignment> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      if (assignment.status !== 'PENDING') {
        throw new Error('Assignment is not in PENDING state');
      }

      // Cancel payment intent if exists
      if (assignment.paymentIntentId) {
        await StripeService.cancelPaymentIntent(assignment.paymentIntentId);
      }

      // Update assignment status
      assignment.status = 'CANCELED';
      await assignment.save({ session });

      // Send notification to mentor
      await NotificationService.send({
        userId: assignment.menteeId.toString(),
        type: 'APPLICATION_CANCELED',
        data: {
          assignmentId: assignment._id,
          opportunityId: assignment.opportunityId
        }
      });

      await session.commitTransaction();
      return assignment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
} 