import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import axios from 'axios';
import { getMyConnectionRequests, respondToConnectionRequest } from '../features/profile/getProfile';

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
  const searchRef = useRef();
  const [showNotifications, setShowNotifications] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [notifRef, setNotifRef] = useState(useRef());

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

  // Click-away listener
  useEffect(() => {
    if (!showSearch) return;
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearch]);

  // Fetch connection requests when notifications dropdown is opened
  useEffect(() => {
    if (showNotifications && user) {
      setLoadingRequests(true);
      getMyConnectionRequests().then(setConnectionRequests).finally(() => setLoadingRequests(false));
    }
  }, [showNotifications, user]);

  // Click-away listener for notifications
  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <>
      <header className="flex justify-between items-center px-12 py-6 bg-white shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <Link to="/" className="text-2xl font-bold text-[#d33] tracking-tight font-['Inter',system-ui,sans-serif]">
          MentorConnect
        </Link>
        <nav className="flex gap-4 items-center">
          {/* Search Icon and Animated Search Box */}
          <div className="relative flex items-center" ref={searchRef}>
            {/* Search icon */}
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition mr-2"
              onClick={() => setShowSearch((v) => !v)}
              aria-label="Search users"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
              </svg>
            </button>
            {/* Search bar and dropdown */}
            <div
              className={`transition-all duration-300 z-50`}
              style={{
                width: showSearch ? 320 : 0,
                opacity: showSearch ? 1 : 0,
                pointerEvents: showSearch ? 'auto' : 'none',
                marginLeft: showSearch ? 12 : 0,
              }}
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchValue}
                  onChange={e => setSearchValue(e.target.value)}
                  placeholder="Search by name or LSS ID"
                  className="rounded-full px-5 py-2 border border-gray-300 shadow bg-white focus:outline-none focus:ring-2 focus:ring-[#d33] text-gray-800 text-base transition-all w-full"
                  style={{
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    width: showSearch ? 320 : 0,
                    transition: 'width 0.3s, opacity 0.3s',
                  }}
                  autoFocus={showSearch}
                />
                {searchValue.trim() !== '' && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {searchLoading && (
                      <div className="px-4 py-3 text-center text-gray-400 text-sm">Searching...</div>
                    )}
                    {searchError && (
                      <div className="px-4 py-3 text-center text-red-400 text-sm">{searchError}</div>
                    )}
                    {!searchLoading && !searchError && searchResults.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">No users found.</div>
                    )}
                    {!searchLoading && !searchError && searchResults.map(user => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 transition rounded-lg cursor-pointer"
                        onMouseDown={() => {
                          setShowSearch(false);
                          navigate(`/profile/${user._id}`);
                        }}
                      >
                        <img
                          src={user.avatarUrl || '/default-avatar.png'}
                          alt={user.firstName}
                          className="w-9 h-9 rounded-full object-cover bg-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {user.lssId}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Notification Bell Icon */}
          {user && (
            <div className="relative flex items-center" ref={notifRef}>
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition mr-2 relative"
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Connection Requests"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                </svg>
                {connectionRequests.length > 0 && showNotifications && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {/* Dropdown for connection requests */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-4 border-b text-lg font-semibold text-gray-800">Connection Requests</div>
                  {loadingRequests ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">Loading...</div>
                  ) : connectionRequests.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-400 text-sm">No pending requests.</div>
                  ) : (
                    connectionRequests.map(request => (
                      <div key={request._id} className="flex items-center gap-3 px-3 py-2 border-b last:border-b-0">
                        <img
                          src={request.avatarUrl || '/default-avatar.png'}
                          alt={request.firstName}
                          className="w-9 h-9 rounded-full object-cover bg-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {request.firstName} {request.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {request.lssId}
                          </div>
                        </div>
                        <button
                          className="px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600 mr-1"
                          onClick={async () => {
                            await respondToConnectionRequest(request._id, 'accept');
                            setConnectionRequests(cr => cr.filter(r => r._id !== request._id));
                          }}
                        >Accept</button>
                        <button
                          className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                          onClick={async () => {
                            await respondToConnectionRequest(request._id, 'reject');
                            setConnectionRequests(cr => cr.filter(r => r._id !== request._id));
                          }}
                        >Reject</button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
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