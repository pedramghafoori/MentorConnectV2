import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lssId, setLssId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [heardAbout, setHeardAbout] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Password strength: at least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const isStrongPassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);

  const toggleHeardAbout = (option) => {
    setHeardAbout(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await register({
        lssId,
        firstName,
        lastName,
        email,
        password,
        phone,
        heardAbout: heardAbout.join(','),
      });
      navigate('/search');
    } catch (err) {
      setError('Unable to register');
    }
  };

  const inputClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e63946] focus:border-transparent outline-none transition-all";
  const labelClasses = "font-semibold mb-1 block text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[600px] mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">Create account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className={labelClasses}>First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="lastName" className={labelClasses}>Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="lssId" className={labelClasses}>LSS ID</label>
            <input
              id="lssId"
              type="text"
              value={lssId}
              onChange={e => setLssId(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

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
            <label htmlFor="phone" className={labelClasses}>Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
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

          <div>
            <label htmlFor="confirmPassword" className={labelClasses}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className={inputClasses}
            />
          </div>

          <div className="mt-6">
            <label className={labelClasses}>How did you hear about MentorConnect? (optional)</label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {['Word of mouth', 'My area chair', 'Lifesaving Society', 'My instructor']
                .map(option => (
                  <label key={option} className="relative">
                    <input
                      type="checkbox"
                      value={option}
                      checked={heardAbout.includes(option)}
                      onChange={() => toggleHeardAbout(option)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 text-sm text-gray-600 border border-gray-400 rounded-lg cursor-pointer transition-all hover:bg-gray-50 peer-checked:bg-[rgba(230,57,70,0.08)] peer-checked:text-[#e63946] peer-checked:border-gray-500 peer-focus:ring-2 peer-focus:ring-gray-600 text-center">
                      {option}
                    </span>
                  </label>
                ))}
            </div>
          </div>

          {error && <p className="text-red-600 mt-2">{error}</p>}
          
          <button 
            type="submit"
            className="w-full py-3 px-4 bg-[#e63946] text-white text-base rounded-lg hover:brightness-110 transition-all cursor-pointer mt-6"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage; 