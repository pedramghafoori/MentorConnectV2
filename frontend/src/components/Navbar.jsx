import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import LoginForm from './Auth/LoginForm';
import RegisterForm from './Auth/RegisterForm';
import axios from 'axios';
import { getMyConnectionRequests, respondToConnectionRequest, getProfile } from '../features/profile/getProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { updateProfile } from '../features/profile/updateProfile';
import Container from './Container.jsx';

const ALL_CERTIFICATIONS = [
  { label: 'First Aid Instructor', value: 'FIRST_AID_INSTRUCTOR' },
  { label: 'Lifesaving Instructor', value: 'LIFESAVING_INSTRUCTOR' },
  { label: 'NL Instructor', value: 'NL_INSTRUCTOR' },
  { label: 'First Aid Examiner', value: 'EXAMINER_FIRST_AID' },
  { label: 'NL Examiner', value: 'EXAMINER_NL' },
  { label: 'Bronze Examiner', value: 'EXAMINER_BRONZE' },
  { label: 'First Aid IT', value: 'INSTRUCTOR_TRAINER_FIRST_AID' },
  { label: 'NL IT', value: 'INSTRUCTOR_TRAINER_NL' },
  { label: 'Lifesaving IT', value: 'INSTRUCTOR_TRAINER_LIFESAVING' },
];

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const profileDropdownRef = useRef();
  const [dropdownPanel, setDropdownPanel] = useState('main');
  const queryClient = useQueryClient();
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'certs'

  // Use React Query to fetch user data
  const { data: fullUserData, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: !!user?._id,
  });

  // Only log user object once when it changes
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', {
        hasProfilePicture: !!user.profilePicture,
        hasAvatarUrl: !!user.avatarUrl,
        firstName: user.firstName
      });
    }
  }, [user]);

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

  const handleSearch = async () => {
    if (!searchValue.trim() && selectedCertifications.length === 0) return;
    
    setSearchLoading(true);
    setSearchError('');
    
    try {
      const params = new URLSearchParams();
      if (searchMode === 'name') {
        params.append('query', searchValue.trim());
      } else if (searchMode === 'certs') {
        // Use the value property for searching
        const certObjects = selectedCertifications.map(certValue => ({
          type: certValue
        }));
        console.log('Searching with certifications:', certObjects);
        params.append('certifications', JSON.stringify(certObjects));
      }
      
      console.log('Search params:', params.toString());
      const { data } = await axios.get(`/api/users/search?${params.toString()}`);
      console.log('Search results:', data);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error details:', err);
      setSearchError('Error searching users');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (!showSearch || (searchMode === 'name' && searchValue.trim() === '') || (searchMode === 'certs' && selectedCertifications.length === 0)) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError('');
      return;
    }
    
    console.log('Search mode:', searchMode);
    console.log('Selected certifications:', selectedCertifications);
    const handler = setTimeout(handleSearch, 300);
    return () => clearTimeout(handler);
  }, [searchValue, showSearch, selectedCertifications, searchMode]);

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

  // Click-away listener for profile dropdown
  useEffect(() => {
    if (!showProfileDropdown) return;
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  // Get profile display (either image or initials)
  const ProfileDisplay = () => {
    const displayData = fullUserData || user;
    if (!displayData) return null;

    const initial = displayData.firstName ? displayData.firstName[0].toUpperCase() : 'U';
    
    if (imageLoadError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#d33] text-white text-lg font-semibold">
          {initial}
        </div>
      );
    }

    return (
      <>
        <img
          src={displayData.profilePicture || displayData.avatarUrl}
          alt={`${displayData.firstName || 'User'}'s profile`}
          className="w-full h-full object-cover"
          onError={() => setImageLoadError(true)}
        />
        {/* Backup initials display while image loads */}
        <div 
          className="absolute inset-0 flex items-center justify-center bg-[#d33] text-white text-lg font-semibold transition-opacity duration-200" 
          style={{ opacity: imageLoadError ? 1 : 0 }}
        >
          {initial}
        </div>
      </>
    );
  };

  // Settings toggles handlers
  const handleToggle = async (field, value) => {
    await updateProfile({ [field]: value });
    refetch();
    queryClient.invalidateQueries(['me']);
    if (user?._id) {
      queryClient.invalidateQueries(['user', user._id]);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center py-4 sm:py-6 bg-white shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" className="text-xl sm:text-2xl font-bold text-[#d33] tracking-tight font-['Inter',system-ui,sans-serif]">
            MentorConnect
          </Link>
          <nav className="flex gap-2 sm:gap-4 items-center">
            {/* Search Icon and Animated Search Box */}
            <div className="relative flex items-center" ref={searchRef}>
              {/* Backdrop overlay for mobile */}
              {showSearch && (
                <div 
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 sm:hidden"
                  onClick={() => setShowSearch(false)}
                />
              )}
              {/* Search icon */}
              <button
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition mr-1 sm:mr-2"
                onClick={() => setShowSearch((v) => !v)}
                aria-label="Search users"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6z" />
                </svg>
              </button>
              {/* Filter icon */}
              {showSearch && (
                <button
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition mr-1 sm:mr-2"
                  onClick={() => setShowAdvancedSearch((v) => !v)}
                  aria-label="Advanced search"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
                    <rect x="4" y="7" width="16" height="2" rx="1" fill="#555"/>
                    <rect x="7" y="11" width="10" height="2" rx="1" fill="#555"/>
                    <rect x="10" y="15" width="4" height="2" rx="1" fill="#555"/>
                  </svg>
                </button>
              )}
              {/* Search bar and dropdown */}
              <div
                className={`transition-all duration-300 z-50 ${
                  showSearch 
                    ? 'sm:relative sm:block fixed left-0 right-0 px-4 mt-4 sm:mt-0 sm:px-0' 
                    : 'hidden'
                }`}
                style={{
                  width: showSearch ? '100%' : 0,
                  maxWidth: showSearch ? (window.innerWidth >= 640 ? '320px' : '100%') : 0,
                  opacity: showSearch ? 1 : 0,
                  pointerEvents: showSearch ? 'auto' : 'none',
                  marginLeft: window.innerWidth >= 640 ? (showSearch ? 12 : 0) : 0,
                  top: window.innerWidth >= 640 ? 'auto' : '72px'
                }}
              >
                <div className="relative w-full max-w-[90%] mx-auto sm:max-w-none">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder="Search by name or LSS ID"
                    className="rounded-full px-5 py-2 border border-gray-300 shadow-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#d33] text-gray-800 text-base transition-all w-full"
                    style={{
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'width 0.3s, opacity 0.3s',
                    }}
                    autoFocus={showSearch}
                    disabled={showAdvancedSearch && searchMode === 'certs'}
                  />
                  {/* Advanced Search Panel (compact, below search bar) */}
                  {showAdvancedSearch && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 z-50 p-4">
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="searchMode"
                            value="name"
                            checked={searchMode === 'name'}
                            onChange={() => setSearchMode('name')}
                          />
                          <span className="text-sm">Name/ID</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="searchMode"
                            value="certs"
                            checked={searchMode === 'certs'}
                            onChange={() => setSearchMode('certs')}
                          />
                          <span className="text-sm">Certifications</span>
                        </label>
                      </div>
                      <div className="mb-2 font-semibold text-sm">Filter by Certifications</div>
                      <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto">
                        {ALL_CERTIFICATIONS.map(cert => (
                          <button
                            key={cert.value}
                            className={`px-2 py-1 rounded-full border text-xs sm:text-sm ${
                              selectedCertifications.includes(cert.value)
                                ? 'bg-[#d33] text-white border-[#d33]'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                            onClick={() => setSelectedCertifications(selectedCertifications.includes(cert.value)
                              ? selectedCertifications.filter(c => c !== cert.value)
                              : [...selectedCertifications, cert.value])}
                            type="button"
                            disabled={searchMode !== 'certs'}
                          >
                            {cert.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                          onClick={() => setSelectedCertifications([])}
                        >Clear</button>
                        <button
                          className="px-4 py-2 rounded bg-[#d33] text-white hover:bg-[#c22] text-sm"
                          onClick={() => {
                            setShowAdvancedSearch(false);
                            if (searchMode === 'certs' && searchValue.trim() === '' && selectedCertifications.length > 0) {
                              setSearchValue(' ');
                            }
                          }}
                        >Search</button>
                      </div>
                    </div>
                  )}
                  {/* Search results dropdown */}
                  {!showAdvancedSearch && (
                    (searchMode === 'name' && searchValue.trim() !== '') ||
                    (searchMode === 'certs' && selectedCertifications.length > 0)
                  ) && (
                    <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 max-h-[calc(100vh-200px)] overflow-y-auto z-50">
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
                            setShowAdvancedSearch(false);
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
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition mr-1 sm:mr-2 relative"
                  onClick={() => setShowNotifications((v) => !v)}
                  aria-label="Connection Requests"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" />
                  </svg>
                  {connectionRequests.length > 0 && showNotifications && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
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
                              queryClient.invalidateQueries(['connections']);
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
                  className="hidden sm:block text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
                >
                  Find Mentors
                </Link>
                {/* Post Course Button - Only visible for mentors */}
                {user.role === 'MENTOR' && (
                  <Link 
                    to="/courses/new" 
                    className="hidden sm:flex items-center gap-2 text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-[9999px] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Post Course
                  </Link>
                )}
                {/* Profile Picture and Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full focus:outline-none ring-2 ring-gray-200 hover:ring-[#d33] transition-all duration-200 overflow-hidden"
                  >
                    <ProfileDisplay />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden z-50 transition-all duration-300" style={{ minHeight: 220 }}>
                      {/* Sliding panels */}
                      <div className="relative w-full h-full" style={{ minHeight: 220 }}>
                        {/* Main panel */}
                        <div className={`absolute inset-0 transition-transform duration-300 ${dropdownPanel === 'main' ? 'translate-x-0' : '-translate-x-full'} bg-white`}>
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span>Profile</span>
                          </Link>
                          {user.role === 'MENTOR' && (
                            <Link
                              to="/courses/my-courses"
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700"
                              onClick={() => setShowProfileDropdown(false)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                              </svg>
                              <span>My Courses</span>
                            </Link>
                          )}
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 w-full text-left"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              handleLogout();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 w-full text-left"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={handleOpenLogin}
                  className="text-gray-800 font-semibold text-sm sm:text-lg hover:text-[#d33] hover:bg-gray-50 px-3 sm:px-5 py-1.5 sm:py-2 rounded-[9999px] transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={handleOpenRegister}
                  className="text-gray-800 font-semibold text-sm sm:text-lg hover:text-[#d33] hover:bg-gray-50 px-3 sm:px-5 py-1.5 sm:py-2 rounded-[9999px] transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </Container>
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