import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReusableModal from './ReusableModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AssignmentService } from '../services/assignment.service';
import { toast } from 'react-toastify';
import SignaturePad from './SignaturePad';
import { PaymentForm } from './PaymentForm';
import api from '../lib/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const ApplyModal = ({ isOpen, onClose, opportunity }) => {
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

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
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
    }
  }, [isOpen]);

  const verifyPrerequisites = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/lss/certifications');
      
      if (response.data && response.data.certifications) {
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
    } else if (opportunity.fee > 0) {
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

    if (opportunity.fee > 0) {
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

    try {
      const assignment = await AssignmentService.createAssignment({
        opportunityId: opportunity._id,
        feeSnapshot: opportunity.fee,
        prerequisites: {
          ...prerequisites,
          signedAt: new Date()
        },
        agreements: signatures,
        paymentIntentId: paymentIntent?.id
      });

      toast.success('Application submitted successfully!');
      onClose();
    } catch (error) {
      setError('Failed to submit application. Please try again.');
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
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
          <div>
            <h3>Sign Mentee Agreement</h3>
            <p>Please review and sign the mentee agreement.</p>
            <SignaturePad onSign={handleMenteeSignature} />
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
                amount={opportunity.fee}
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
          {opportunity.fee > 0 && (
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
    fee: PropTypes.number.isRequired
  }).isRequired
};

export default ApplyModal; 