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
import CreateCourseModal from './Course/CreateCourseModal';
import AvatarFallback from './AvatarFallback';

import { useNotifications } from '@/context/NotificationContext';          // NEW
import NotificationPopoverDesktop from '@/components/NotificationPopoverDesktop'; // NEW

/* ------------------------------------------------------------------ */

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

  /* ------------ NEW: unread badge from notification context -------- */
  const { unread } = useNotifications();

  /* ------------ search & other local state ------------------------- */
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const searchRef = useRef();

  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef();
  const [dropdownPanel, setDropdownPanel] = useState('main');

  const queryClient = useQueryClient();

  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'certs'

  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);

  /* ------------------------------------------------------------------ */
  /* React‑Query: user profile */
  const { data: fullUserData, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: !!user?._id,
  });

  /* ---------- existing helper handlers (login/logout etc.) ---------- */
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOpenLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.href);
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

  /* ------------- search logic (unchanged from your file) ------------ */
  // ...  (all your existing search hooks/effects remain intact)

  /* ------------- connection requests fetch (unchanged) -------------- */
  useEffect(() => {
    if (!user) return;
    setLoadingRequests(true);
    getMyConnectionRequests()
      .then(setConnectionRequests)
      .finally(() => setLoadingRequests(false));
  }, [user]);

  /* ------------- profile click‑away listener (unchanged) ------------ */
  useEffect(() => {
    if (!showProfileDropdown) return;
    function handleClickOutside(e) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  /* ------------- avatar / profile display helper (unchanged) -------- */
  // ... keep your ProfileDisplay component exactly as it was ...

  /* --------------------------- JSX ---------------------------------- */
  return (
    <>
      <header className="flex justify-between items-center py-2 sm:py-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,.06)]">
        <Container style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* ---------- logo & forum link (unchanged) ---------- */}
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-[#d33] tracking-tight">
              MentorConnect
            </Link>
            <Link
              to="/forum"
              className="text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-full transition-colors"
            >
              Lifeguard Forum
            </Link>
          </div>

          {/* ---------- nav controls ---------- */}
          <nav className="flex gap-2 sm:gap-4 items-center">
            {/* ----------- existing search icon & box (unchanged) ---------- */}
            {/* keep all your search JSX exactly as before */}

            {/* ==========  NEW NOTIFICATION SECTION  ========== */}
            {user && (
              <>
                {/* MOBILE bell – navigates to full page */}
                <Link to="/notifications" className="md:hidden relative" aria-label="Notifications">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full" />
                  )}
                </Link>

                {/* DESKTOP pop‑over */}
                <NotificationPopoverDesktop />
              </>
            )}

            {/* ----------- the rest of your nav (assignments link, profile dropdown etc.) ----------- */}
            {/* nothing below this comment changed except any imports removed earlier */}
            {user ? (
              <>
                <Link
                  to="/assignments"
                  className="hidden sm:block text-gray-800 font-semibold text-lg hover:text-[#d33] hover:bg-gray-50 px-5 py-2 rounded-full transition-colors"
                >
                  My Assignments
                </Link>
                {/* ---------------- profile pic & dropdown (unchanged) --------------- */}
                {/* keep your existing profile dropdown JSX exactly as is */}
              </>
            ) : (
              <>
                <button
                  onClick={handleOpenLogin}
                  className="text-gray-800 font-semibold text-sm sm:text-lg hover:text-[#d33] hover:bg-gray-50 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={handleOpenRegister}
                  className="text-gray-800 font-semibold text-sm sm:text-lg hover:text-[#d33] hover:bg-gray-50 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full transition-colors"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </Container>
      </header>

      {/* --------- existing modals (login / register / create course) --------- */}
      <Modal isOpen={showLoginModal} onClose={handleCloseModals}>
        <LoginForm onClose={handleCloseModals} onSwitchToRegister={handleOpenRegister} />
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={handleCloseModals}>
        <RegisterForm onClose={handleCloseModals} onSwitchToLogin={handleOpenLogin} />
      </Modal>

      <CreateCourseModal
        isOpen={showCreateCourseModal}
        onClose={() => setShowCreateCourseModal(false)}
      />
    </>
  );
};

export default Navbar;