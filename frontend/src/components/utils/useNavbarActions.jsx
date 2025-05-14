import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../features/profile/getProfile';
import { updateProfile } from '../../features/profile/updateProfile';
import axios from 'axios';

export default function useNavbarActions() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [searchMode, setSearchMode] = useState('name');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dropdownPanel, setDropdownPanel] = useState('main');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const { unread } = useNotifications();
  const [showNotificationOverlay, setShowNotificationOverlay] = useState(false);
  const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
  const searchRef = useRef();
  const searchIconRef = useRef();
  const profileDropdownRef = useRef();
  const profileButtonRef = useRef();
  const bellRef = useRef();
  const queryClient = useQueryClient();

  // Fetch full user data
  const { data: fullUserData, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
    enabled: !!user?._id,
  });

  // Search logic
  const handleSearch = async () => {
    if (!searchValue.trim() && selectedCertifications.length === 0) return;
    setSearchLoading(true);
    setSearchError('');
    try {
      const params = new URLSearchParams();
      if (searchMode === 'name') {
        params.append('query', searchValue.trim());
      } else if (searchMode === 'certs') {
        const certObjects = selectedCertifications.map(certValue => ({ type: certValue }));
        params.append('certifications', JSON.stringify(certObjects));
      }
      const { data } = await axios.get(`/api/users/search?${params.toString()}`);
      setSearchResults(data);
    } catch (err) {
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
    const handler = setTimeout(handleSearch, 300);
    return () => clearTimeout(handler);
  }, [searchValue, showSearch, selectedCertifications, searchMode]);

  // Click-away listeners for search and profile dropdown
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

  // Profile display logic
  const ProfileDisplay = () => {
    const displayData = fullUserData || user;
    if (!displayData) return null;
    const defaultCrop = { offset: { x: 0, y: 0 }, scale: 1, rotate: 0 };
    const savedCrop = displayData.avatarCrop || defaultCrop;
    const relativeOffset = savedCrop.offset || defaultCrop.offset;
    const scale = savedCrop.scale || defaultCrop.scale;
    const rotate = savedCrop.rotate || defaultCrop.rotate;
    const size = 40;
    const pixelOffset = {
      x: relativeOffset.x * size,
      y: relativeOffset.y * size,
    };
    if (displayData.profilePicture || displayData.avatarUrl) {
      return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: '#eee' }}>
          <img
            src={displayData.profilePicture || displayData.avatarUrl}
            alt={`${displayData.firstName || 'User'}'s profile`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) translate(${pixelOffset.x}px, ${pixelOffset.y}px) scale(${scale}) rotate(${rotate}deg)` }}
          />
        </div>
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center">
          {/* AvatarFallback imported in parent */}
        </div>
      );
    }
  };

  // Profile dropdown handlers
  const handleToggle = async (field, value) => {
    await updateProfile({ [field]: value });
    refetch();
    queryClient.invalidateQueries(['me']);
    if (user?._id) {
      queryClient.invalidateQueries(['user', user._id]);
    }
  };

  return {
    user,
    logout,
    showLoginModal,
    setShowLoginModal,
    showRegisterModal,
    setShowRegisterModal,
    showSearch,
    setShowSearch,
    searchValue,
    setSearchValue,
    searchResults,
    setSearchResults,
    searchLoading,
    setSearchLoading,
    searchError,
    setSearchError,
    showAdvancedSearch,
    setShowAdvancedSearch,
    selectedCertifications,
    setSelectedCertifications,
    searchMode,
    setSearchMode,
    showProfileDropdown,
    setShowProfileDropdown,
    dropdownPanel,
    setDropdownPanel,
    showCreateCourseModal,
    setShowCreateCourseModal,
    unread,
    showNotificationOverlay,
    setShowNotificationOverlay,
    showDesktopDropdown,
    setShowDesktopDropdown,
    searchRef,
    searchIconRef,
    profileDropdownRef,
    profileButtonRef,
    bellRef,
    ProfileDisplay,
    handleToggle,
    navigate,
    refetch,
    fullUserData,
  };
} 