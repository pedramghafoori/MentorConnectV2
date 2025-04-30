import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOpenLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const handleOpenRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleCloseModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  useEffect(() => {
    if (!showSearch || !searchValue.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    const handler = setTimeout(async () => {
      console.log('Searching for:', searchValue.trim());
      try {
        const { data } = await axios.get(`/api/users/search?query=${encodeURIComponent(searchValue.trim())}`);
        console.log('Search response:', data);
        setSearchResults(data);
        setSearchLoading(false);
      } catch (err) {
        console.error('Search error:', err);
        setSearchError('Error searching users');
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchValue, showSearch]);

  return (
    <>
      <header className="flex justify-between items-center px-12 py-6 bg-white shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <Link to="/" className="text-2xl font-bold text-[#d33] tracking-tight font-['Inter',system-ui,sans-serif]">
          MentorConnect
        </Link>
        <nav className="flex gap-4 items-center">
          {/* Search Icon and Animated Search Box */}
          <div className="relative flex items-center">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search users"
            >
              {/* Search icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
              </svg>
            </button>
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${showSearch ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'} z-50`}
              style={{ minWidth: 260 }}
            >
              <input
                type="text"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="Search by name or LSS ID..."
                className="rounded-full px-5 py-2 border border-gray-300 shadow bg-white focus:outline-none focus:ring-2 focus:ring-[#d33] text-gray-800 text-base transition-all w-full"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                autoFocus={showSearch}
                onBlur={() => setShowSearch(false)}
              />
            </div>
          </div>
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
              >
                Find Mentors
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors font-inherit"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleOpenLogin}
                className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleOpenRegister}
                className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
              >
                Register
              </button>
            </>
          )}
        </nav>
      </header>

      {/* Auth Modals */}
      <Modal isOpen={showLoginModal} onClose={handleCloseModals}>
        <LoginForm onClose={handleCloseModals} onSwitchToRegister={handleOpenRegister} />
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={handleCloseModals}>
        <RegisterForm onClose={handleCloseModals} onSwitchToLogin={handleOpenLogin} />
      </Modal>
    </>
  );
};

export default Navbar; 