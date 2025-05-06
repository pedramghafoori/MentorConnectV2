import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEnablePayouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('/api/stripe/create-oauth-link');
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable payouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for success message in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setSuccess('Stripe account connected successfully!');
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="settings-section">
        <h2>Payout Settings</h2>
        {user.role === 'MENTOR' ? (
          user.stripeAccountId ? (
            <div className="payout-status">
              <span className="badge badge-success">Payouts enabled</span>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleEnablePayouts}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Enable payouts'}
            </button>
          )
        ) : (
          <p>Payout settings are only available for mentors.</p>
        )}
      </div>
    </div>
  );
};

export default Settings; 