import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReusableModal from '../ReusableModal';

export default function LoginForm({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login' or 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [showRestoredModal, setShowRestoredModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login({ email, password });
      if (response.user.wasRestored) {
        setShowRestoredModal(true);
      } else {
        onClose && onClose();
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectUrl;
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError(null);
    setResetSent(false);
    try {
      // await api.post('/auth/request-password-reset', { email: resetEmail });
      setResetSent(true);
    } catch (err) {
      setResetError('Failed to send reset email.');
    }
  };

  if (view === 'reset' || view === 'login') {
    return (
      <>
        <div style={{ position: 'relative', minHeight: 320 }}>
          <AnimatePresence initial={false} mode="wait">
            {view === 'login' && (
              <motion.form
                key="login"
                onSubmit={handleSubmit}
                className="space-y-4"
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', width: '100%' }}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d33] focus:border-transparent outline-none transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d33] focus:border-transparent outline-none transition-all"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <button
                  type="submit"
                  className="w-full bg-[#d33] text-white py-2 rounded-[9999px] font-semibold hover:bg-[#b22] transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="text-center text-sm mt-2">
                  Don't have an account?{' '}
                  <button type="button" className="text-[#d33] underline" onClick={onSwitchToRegister}>
                    Register
                  </button>
                </div>
                <div className="text-center text-xs mt-2">
                  <button
                    type="button"
                    className="text-[#d33] underline hover:text-[#b22]"
                    onClick={() => setView('reset')}
                  >
                    Forgot password?
                  </button>
                </div>
              </motion.form>
            )}
            {view === 'reset' && (
              <motion.form
                key="reset"
                onSubmit={handleResetSubmit}
                className="space-y-4 relative"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ position: 'absolute', width: '100%' }}
              >
                <button
                  type="button"
                  className="absolute top-0 left-0 text-2xl text-[#d33] hover:text-[#b22]"
                  onClick={() => { setView('login'); setResetEmail(''); setResetSent(false); setResetError(null); }}
                  aria-label="Back"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ←
                </button>
                <h2 className="text-xl font-bold text-center mb-4">Reset Password</h2>
                {resetSent ? (
                  <div className="text-green-600 text-center">If that email exists, a reset link has been sent.</div>
                ) : (
                  <>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d33] focus:border-transparent outline-none transition-all"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                    />
                    {resetError && <div className="text-red-500 text-sm">{resetError}</div>}
                    <button
                      type="submit"
                      className="w-full bg-[#d33] text-white py-2 rounded-[9999px] font-semibold hover:bg-[#b22] transition-colors"
                    >
                      Send Reset Link
                    </button>
                  </>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <ReusableModal
          isOpen={showRestoredModal}
          onClose={() => {
            setShowRestoredModal(false);
            navigate('/dashboard');
          }}
          title="Welcome Back!"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Your account has been successfully restored!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-600">
              We're glad to have you back. Your account and all your data have been restored.
            </p>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowRestoredModal(false);
                  navigate('/dashboard');
                }}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#d33] hover:bg-[#c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </ReusableModal>
      </>
    );
  }
} 