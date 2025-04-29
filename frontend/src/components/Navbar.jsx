import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  return (
    <>
      <header className="flex justify-between items-center px-12 py-6 bg-white shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <Link to="/" className="text-2xl font-bold text-[#d33] tracking-tight font-['Inter',system-ui,sans-serif]">
          MentorConnect
        </Link>
        <nav className="flex gap-4">
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