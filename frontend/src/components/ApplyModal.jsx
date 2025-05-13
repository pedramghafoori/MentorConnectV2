import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReusableModal from './ReusableModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AssignmentService } from '../services/assignment.service';
import { toast } from 'react-toastify';
import SignaturePad from './SignaturePad';
import PaymentForm from './PaymentForm';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Initialize Stripe with error handling
let stripePromise = null;
try {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!key) {
    console.error('Stripe public key is not defined in environment variables');
  } else {
    stripePromise = loadStripe(key);
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

const ApplyModal = ({ isOpen, onClose, opportunity, onSuccess }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [prerequisites, setPrerequisites] = useState({
    verified: false,
    method: null,
    verifiedAt: null,
    signedAt: null
  });
  const [signatures, setSignatures] = useState({
    menteeSignature: null,
    amaSignature: null
  });
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine what is required for this opportunity
  const requiresTrainer = opportunity.requiredLevel === 'trainer' || opportunity.requiredLevel === 'both';
  const requiresExaminer = opportunity.requiredLevel === 'examiner' || opportunity.requiredLevel === 'both';

  const needsVerification =
    (requiresTrainer && !user?.hasTrainerCourse) ||
    (requiresExaminer && !user?.hasExaminerCourse);
  console.log('[ApplyModal] user:', user);
  console.log('[ApplyModal] needsVerification:', needsVerification);
  console.log('[ApplyModal] currentStep (init):', currentStep);

  useEffect(() => {
    if (isOpen) {
      if (!needsVerification) {
        setPrerequisites({
          verified: true,
          method: 'scraper',
          verifiedAt: new Date(),
          signedAt: null
        });
        setCurrentStep(2);
        setSignatures({
          menteeSignature: null,
          amaSignature: null
        });
        setPaymentIntent(null);
        setError(null);
        console.log('[ApplyModal] Skipping verification, setting currentStep to 2 and prerequisites to verified');
      } else {
      setPrerequisites({
        verified: false,
        method: null,
        verifiedAt: null,
        signedAt: null
      });
      setSignatures({
        menteeSignature: null,
        amaSignature: null
      });
      setPaymentIntent(null);
      setError(null);
        setCurrentStep(1);
        console.log('[ApplyModal] Needs verification, setting currentStep to 1');
      }
    }
  }, [isOpen, needsVerification]);

  const verifyPrerequisites = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.lssId) {
        // If user doesn't have an LSS ID, show AMA waiver
        setPrerequisites({
          verified: false,
          method: 'ama',
          verifiedAt: null,
          signedAt: null
        });
        setCurrentStep(2);
        return;
      }

      const response = await api.post('/lss/certifications', {
        lssId: user.lssId
      });
      
      if (response.data && response.data.meetsPrerequisites) {
        setPrerequisites({
          verified: true,
          method: 'scraper',
          verifiedAt: new Date(),
          signedAt: null
        });
        setCurrentStep(2);
      } else {
        // Show AMA waiver
        setPrerequisites({
          verified: false,
          method: 'ama',
          verifiedAt: null,
          signedAt: null
        });
        setCurrentStep(2);
      }
    } catch (error) {
      setError('Failed to verify prerequisites. Please try again.');
      toast.error('Failed to verify prerequisites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenteeSignature = (signature) => {
    setSignatures(prev => ({
      ...prev,
      menteeSignature: signature
    }));

    if (prerequisites.method === 'ama') {
      // If using AMA waiver, collect that signature too
      setCurrentStep(2.5);
    } else if (opportunity.price > 0) {
      // If there's a fee, move to payment step
      setCurrentStep(3);
    } else {
      // If no fee, submit application
      handleSubmit();
    }
  };

  const handleAmaSignature = (signature) => {
    setSignatures(prev => ({
      ...prev,
      amaSignature: signature
    }));

    if (opportunity.price > 0) {
      setCurrentStep(3);
    } else {
      handleSubmit();
    }
  };

  const handlePaymentSuccess = (intent) => {
    setPaymentIntent(intent);
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    // Validation: ensure required fields are present
    if (!signatures.menteeSignature) {
      setError('Please sign the agreement before submitting.');
      setLoading(false);
      return;
    }
    if (!prerequisites.method) {
      setError('Verification method is required.');
      setLoading(false);
      return;
    }

    try {
      const startDate = opportunity.schedule?.isExamOnly
        ? opportunity.schedule.examDate
        : (opportunity.schedule?.courseDates?.[0] || null);

      if (!startDate) {
        setError('Opportunity has no valid start date.');
        setLoading(false);
        return;
      }

      const assignment = await AssignmentService.createAssignment({
        opportunityId: opportunity._id,
        feeSnapshot: opportunity.price || 0,
        prerequisites: {
          ...prerequisites,
          signedAt: new Date()
        },
        agreements: signatures,
        paymentIntentId: paymentIntent?.id,
        startDate: new Date(startDate)
      });

      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to submit application. Please try again.');
      toast.error('Failed to submit application. Please try again.');
      // If error is duplicate key, re-check application status
      if (error?.response?.data?.error?.includes('duplicate key')) {
        onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    console.log('[ApplyModal] renderStepContent - currentStep:', currentStep, 'needsVerification:', needsVerification);
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3>Verify Prerequisites</h3>
            <p>We'll verify your LSS certification before proceeding.</p>
            <button
              onClick={verifyPrerequisites}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Verifying...' : 'Verify Certification'}
            </button>
          </div>
        );
      case 2:
        return (
          <div className="mentee-sign-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Sign Mentee Agreement</h3>
            <p style={{ marginBottom: 16, color: '#444', fontSize: '1rem' }}>
              Please review the agreement below and sign to continue your application.
            </p>
            <div className="mentee-agreement-text" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 20, background: '#f9f9f9', maxWidth: 480, width: '100%', fontSize: '1rem', color: '#222' }}>
              <strong>Mentee Agreement</strong>
              <p style={{ marginTop: 8 }}>
                By signing this agreement, you acknowledge your commitment to attend all sessions, complete all required preparation, and communicate promptly with your mentor. Failure to do so may result in removal from the opportunity.<br />
                You agree to uphold the standards and expectations set by the mentor and the organization.
              </p>
            </div>
            <div style={{ width: 320, marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Your Signature</label>
            <SignaturePad onSign={handleMenteeSignature} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <button onClick={() => setSignatures(prev => ({ ...prev, menteeSignature: null }))} className="btn btn-secondary" style={{ padding: '8px 24px', borderRadius: 6, background: '#f3f4f6', color: '#222', border: '1px solid #ccc' }}>Clear</button>
              <button onClick={handleSubmit} className="btn btn-primary" style={{ padding: '8px 32px', borderRadius: 6, background: '#2563eb', color: '#fff', fontWeight: 600 }} disabled={loading}>
                {loading ? 'Submitting...' : 'Sign & Continue'}
              </button>
            </div>
            {error && <div className="error-message" style={{ color: '#d33', marginTop: 12 }}>{error}</div>}
          </div>
        );
      case 2.5:
        return (
          <div>
            <h3>Sign AMA Waiver</h3>
            <p>Please review and sign the AMA waiver.</p>
            <SignaturePad onSign={handleAmaSignature} />
          </div>
        );
      case 3:
        return (
          <div>
            <h3>Payment</h3>
            <p>Complete payment to finalize your application.</p>
            <Elements stripe={stripePromise}>
              <PaymentForm
                amount={opportunity.price || 0}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Opportunity"
    >
      <div className="apply-modal">
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            Verify Prerequisites
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            Sign Agreement{prerequisites.method === 'ama' ? 's' : ''}
          </div>
          {opportunity.price > 0 && (
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              Payment
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {renderStepContent()}
      </div>
    </ReusableModal>
  );
};

ApplyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  opportunity: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default ApplyModal; 