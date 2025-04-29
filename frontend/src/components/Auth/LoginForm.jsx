import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginForm({ onClose, onSwitchToRegister }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password }, () => {
        onClose && onClose();
        navigate('/dashboard');
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
    </form>
  );
} 