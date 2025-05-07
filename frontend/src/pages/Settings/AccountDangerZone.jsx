import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AccountDangerZone() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete('http://localhost:4000/api/account', { data: { password }, withCredentials: true });
      // Clear localStorage/cookies and redirect
      localStorage.clear();
      document.cookie = '';
      navigate('/goodbye');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #f0c0c0', paddingTop: '2rem' }}>
      <h3 style={{ color: '#b32', fontWeight: 700, marginBottom: '1.2rem' }}>Danger Zone</h3>
      <button
        style={{ background: '#d33', color: '#fff', borderRadius: 999, padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
      >
        Delete my account & data
      </button>
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem 2.2rem', maxWidth: 400, boxShadow: '0 4px 32px rgba(0,0,0,0.13)' }}>
            <h4 style={{ color: '#b32', fontWeight: 700, marginBottom: 12 }}>Are you sure?</h4>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: 18 }}>
              This immediately disables your profile and starts a 30-day data-erasure countdown.<br />
              You can cancel by logging back in before then.
            </p>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: '0.6rem', borderRadius: 8, border: '1px solid #ddd' }}
              disabled={loading}
            />
            {error && <div style={{ color: '#d33', marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={handleDelete}
                disabled={loading || !password}
                style={{ background: '#d33', color: '#fff', borderRadius: 999, padding: '0.6rem 1.5rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                {loading ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                style={{ background: '#eee', color: '#333', borderRadius: 999, padding: '0.6rem 1.5rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 