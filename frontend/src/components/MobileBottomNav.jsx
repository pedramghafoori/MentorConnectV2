import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useNavbarActions from './utils/useNavbarActions.jsx';
import AvatarFallback from './AvatarFallback';
import './MobileBottomNav.css';
import CreateCourseModal from './Course/CreateCourseModal';
import NotificationOverlay from './NotificationOverlay';

const MobileBottomNav = () => {
  const {
    user,
    unread,
    showSearch,
    setShowSearch,
    showNotificationOverlay,
    setShowNotificationOverlay,
    showProfileDropdown,
    setShowProfileDropdown,
    ProfileDisplay,
    profileButtonRef,
    searchIconRef,
    bellRef,
    navigate,
    // For search UI:
    searchValue,
    setSearchValue,
    searchResults,
    searchLoading,
    searchError,
    showAdvancedSearch,
    setShowAdvancedSearch,
    selectedCertifications,
    setSelectedCertifications,
    searchMode,
    setSearchMode,
    // For profile dropdown:
    dropdownPanel,
    setDropdownPanel,
    showCreateCourseModal,
    setShowCreateCourseModal,
    logout,
    handleToggle,
    fullUserData,
    refetch,
  } = useNavbarActions();
  const location = useLocation();

  // Add state variables for animation
  const [searchAnimatingOut, setSearchAnimatingOut] = useState(false);
  const [searchSlideIn, setSearchSlideIn] = useState(false);
  const [profileAnimatingOut, setProfileAnimatingOut] = useState(false);
  const [profileSlideIn, setProfileSlideIn] = useState(false);

  if (!user) return null;

  // Helper: Render the search UI (copied from Navbar, but styled for mobile)
  const renderSearchUI = () => (
    <div className="mobile-search-overlay" onClick={() => setShowSearch(false)}>
      <div className="mobile-search-panel" onClick={e => e.stopPropagation()} style={{
        transform: searchAnimatingOut ? 'translateY(100%)' : searchSlideIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)'
      }}>
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search by name or LSS ID"
          className="mobile-search-input"
          autoFocus
        />
        {/* Advanced search panel, if open */}
        {showAdvancedSearch && (
          <div className="mobile-advanced-search-panel">
            <div className="mobile-advanced-search-modes">
              <label><input type="radio" name="searchMode" value="name" checked={searchMode === 'name'} onChange={() => setSearchMode('name')} /> Name/ID</label>
              <label><input type="radio" name="searchMode" value="certs" checked={searchMode === 'certs'} onChange={() => setSearchMode('certs')} /> Certifications</label>
            </div>
            <div className="mobile-advanced-search-certs">
              {/* Render cert buttons */}
              {/* ... (copy from Navbar) ... */}
            </div>
            <button onClick={() => setShowAdvancedSearch(false)}>Close</button>
          </div>
        )}
        <button className="mobile-advanced-search-btn" onClick={() => setShowAdvancedSearch(v => !v)}>Advanced</button>
        <div className="mobile-search-results">
          {searchLoading && <div>Searching...</div>}
          {searchError && <div>{searchError}</div>}
          {!searchLoading && !searchError && searchResults.length === 0 && <div>No users found.</div>}
          {!searchLoading && !searchError && searchResults.map(user => (
            <div key={user._id} className="mobile-search-result" onMouseDown={() => {
              setShowSearch(false);
              setShowAdvancedSearch(false);
              navigate(`/profile/${user._id}`);
            }}>
              <img src={user.avatarUrl || '/default-avatar.png'} alt={user.firstName} className="mobile-search-result-avatar" />
              <div>
                <div>{user.firstName} {user.lastName}</div>
                <div>{user.lssId}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper: Render notification overlay (reuse NotificationOverlay component if possible)
  const renderNotificationOverlay = () => (
    <NotificationOverlay open={true} onClose={() => setShowNotificationOverlay(false)} />
  );

  // Helper: Render profile dropdown (copy from Navbar, but styled for mobile, appears above avatar)
  const renderProfileDropdown = () => (
    <div className="mobile-profile-dropdown" onClick={() => setShowProfileDropdown(false)}>
      <div className="mobile-profile-panel" onClick={e => e.stopPropagation()} style={{
        transform: profileAnimatingOut ? 'translateY(100%)' : profileSlideIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)'
      }}>
        {/* Copy dropdown panel logic from Navbar, but vertical and mobile-friendly */}
        <button onClick={() => { setShowProfileDropdown(false); setShowCreateCourseModal(true); }}>Post an Opportunity</button>
        <button onClick={() => { setShowProfileDropdown(false); navigate('/profile'); }}>Profile</button>
        <button onClick={() => { setShowProfileDropdown(false); navigate('/courses/my-courses'); }}>My Courses</button>
        <button onClick={() => { setShowProfileDropdown(false); navigate('/settings'); }}>Settings</button>
        <button onClick={() => { setShowProfileDropdown(false); logout(); }}>Logout</button>
      </div>
    </div>
  );

  // Update useEffect for search overlay
  useEffect(() => {
    if (showSearch && !searchAnimatingOut) {
      setSearchSlideIn(true);
    } else {
      setSearchSlideIn(false);
    }
  }, [showSearch, searchAnimatingOut]);

  // Update useEffect for profile dropdown
  useEffect(() => {
    if (showProfileDropdown && !profileAnimatingOut) {
      setProfileSlideIn(true);
    } else {
      setProfileSlideIn(false);
    }
  }, [showProfileDropdown, profileAnimatingOut]);

  return (
    <>
      <nav className="mobile-bottom-nav" style={{ zIndex: 2100 }}>
        <button className={`nav-item${location.pathname.startsWith('/dashboard') && !showSearch && !showNotificationOverlay && !showProfileDropdown ? ' active' : ''}`} aria-label="Home" onClick={() => {
          setShowSearch(false);
          setShowNotificationOverlay(false);
          setShowProfileDropdown(false);
          navigate('/dashboard');
        }}>
          <svg viewBox="0 0 24 24" className="nav-icon"><path d="M3 12L12 4l9 8v8a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3H9v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
        </button>
        <button className={`nav-item${showSearch ? ' active' : ''}`} aria-label="Search" ref={searchIconRef} onClick={() => {
          setShowSearch(true);
          setShowNotificationOverlay(false);
          setShowProfileDropdown(false);
        }}>
          <svg viewBox="0 0 24 24" className="nav-icon"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/></svg>
        </button>
        <button className={`nav-item${showNotificationOverlay ? ' active' : ''}`} aria-label="Notifications" ref={bellRef} onClick={() => {
          setShowNotificationOverlay(v => !v);
          setShowSearch(false);
          setShowProfileDropdown(false);
        }}>
          <svg viewBox="0 0 24 24" className="nav-icon"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
          {unread > 0 && <span className="nav-badge" />}
        </button>
        <button className={`nav-item${showProfileDropdown ? ' active' : ''}`} aria-label="Profile" ref={profileButtonRef} onClick={() => {
          setShowProfileDropdown(v => !v);
          setShowSearch(false);
          setShowNotificationOverlay(false);
        }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              background: '#eee',
            }}
          >
            <ProfileDisplay size={40} />
          </div>
        </button>
      </nav>
      {/* Overlays/dropdowns rendered above the bottom nav */}
      {showSearch && renderSearchUI()}
      {showNotificationOverlay && renderNotificationOverlay()}
      {showProfileDropdown && renderProfileDropdown()}
      {showCreateCourseModal && (
        <CreateCourseModal isOpen={showCreateCourseModal} onClose={() => setShowCreateCourseModal(false)} />
      )}
    </>
  );
};

export default MobileBottomNav;