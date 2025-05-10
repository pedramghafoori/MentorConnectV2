import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const PaymentForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        }
      });

      if (submitError) {
        setError(submitError.message);
      } else {
        onSuccess(elements.getElement(PaymentElement));
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="amount-display">
        <h4>Total Amount</h4>
        <p className="amount">${amount.toFixed(2)} CAD</p>
      </div>

      <PaymentElement />

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn btn-primary w-full mt-4"
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)} CAD`}
      </button>
    </form>
  );
};

PaymentForm.propTypes = {
  amount: PropTypes.number.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default PaymentForm; 