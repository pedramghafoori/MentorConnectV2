import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Modal from './Modal';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLogout = () => {
    logout();
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
      <header className="flex justify-between items-center px-12 py-6 bg-white shadow-sm border-b border-gray-100">
        <Link to="/" className="text-2xl font-bold text-[#ff385c] tracking-tight font-inter">
          MentorConnect
        </Link>
        <nav className="flex gap-8">
          {user ? (
            <>
              <Link 
                to="/mentors" 
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              >
                Connect
              </Link>
              <Link 
                to="/bookings" 
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              >
                Bookings
              </Link>
              <Link 
                to="/profile" 
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout} 
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors font-inherit"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleOpenLogin}
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
              >
                Login
              </button>
              <button 
                onClick={handleOpenRegister}
                className="text-gray-800 font-semibold text-lg hover:text-[#ff385c] hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
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