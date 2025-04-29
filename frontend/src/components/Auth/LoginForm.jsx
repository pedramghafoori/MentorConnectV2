import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const LoginForm = ({ onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all";
  const labelClasses = "font-semibold mb-1 block text-gray-700";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Welcome back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className={labelClasses}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClasses}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={inputClasses}
          />
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
        
        <button 
          type="submit"
          className="w-full py-3 px-4 bg-[#e63946] text-white text-base rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          Sign In
        </button>

        <p className="text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#e63946] hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm; 