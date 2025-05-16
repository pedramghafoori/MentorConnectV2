import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../features/profile/updateProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../features/profile/getProfile';
import Select from 'react-select';
import Container from '../../components/Container';
import '../../css/settings.css';
import AccountDangerZone from '../../components/Account/AccountDangerZone';
import { FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import LANGUAGES from '../../lib/languages.json';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import CertificationManager from '../../components/Admin/CertificationManager';
import WaiverModal from '../../components/WaiverModal/WaiverModal';
import { format } from 'date-fns';
import { SignedWaivers } from '../../components/SignedWaivers/SignedWaivers';
import { DriveService } from '../../services/drive.service';

const menuItems = [
  // { key: 'mentor', label: 'Mentor Preferences' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'tax', label: 'Tax and Payout' },
  { key: 'connections', label: 'Connections' },
  { key: 'account', label: 'Account Settings' },
  { key: 'certification', label: 'Certification Management' },
  { key: 'agreements', label: 'Agreements' },
];

// Commenting out these options as they correspond to commented fields in user.ts
/*
const PREP_OPTIONS = [
  { value: 'lesson-plan', label: 'Lesson Plan' },
  { value: 'scenarios', label: 'Scenarios' },
  { value: 'exam-plan', label: 'Exam Plan' },
  { value: 'must-sees', label: 'Must-Sees' },
];

const INVOLVEMENT_OPTIONS = [
  { value: 'full-course', label: 'Full Course' },
  { value: 'exam-only', label: 'Exam Only' },
];
*/

// Add a mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 700 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 700);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState('privacy');
  const queryClient = useQueryClient();
  const { data: fullUserData, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
  });
  const [showLssId, setShowLssId] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [allowFeatured, setAllowFeatured] = useState(true);
  const [allowSearch, setAllowSearch] = useState(true);
  const [collectsHST, setCollectsHST] = useState(false);
  const [taxId, setTaxId] = useState('');
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState(null);
  const [taxSuccess, setTaxSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [languagesError, setLanguagesError] = useState(null);
  const [languagesSuccess, setLanguagesSuccess] = useState(false);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(48);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [workplaces, setWorkplaces] = useState([]);
  const [newWorkplace, setNewWorkplace] = useState('');
  const [workplacesLoading, setWorkplacesLoading] = useState(false);
  const [workplacesError, setWorkplacesError] = useState(null);
  const [workplacesSuccess, setWorkplacesSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiverStatus, setWaiverStatus] = useState({ hasSigned: false, signedAt: null, waiverId: null });
  const [waiverLoading, setWaiverLoading] = useState(false);
  const [waiverError, setWaiverError] = useState(null);
  const [isDriveConnected, setIsDriveConnected] = useState(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState(null);
  const [driveSuccess, setDriveSuccess] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('Settings page - Current user:', user);
  }, [user]);

  useEffect(() => {
    if (fullUserData) {
      setShowLssId(!!fullUserData.showLssId);
      setShowConnections(!!fullUserData.showConnections);
      setAllowFeatured(!!fullUserData.allowFeatured);
      setAllowSearch(!!fullUserData.allowSearch);
      setCollectsHST(!!fullUserData.collectsHST);
      setTaxId(fullUserData.taxId || '');
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && typeof fullUserData.cancellationPolicyHours === 'number') {
      setCancellationPolicyHours(fullUserData.cancellationPolicyHours);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && Array.isArray(fullUserData.languages)) {
      setLanguages(
        fullUserData.languages.map(code =>
          LANGUAGES.find(opt => opt.value === code) || { value: code, label: code }
        )
      );
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && fullUserData._id) {
      axios.get(`/users/${fullUserData._id}/review-summary`)
        .then(res => setRatingSummary(res.data))
        .catch(err => console.error('Error loading review summary:', err));
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && Array.isArray(fullUserData.workplaces)) {
      setWorkplaces(fullUserData.workplaces);
    }
  }, [fullUserData]);

  // Check for success message in URL params and refresh user data
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log('[SettingsPage] URL params:', Object.fromEntries(params.entries()));
    console.log('[SettingsPage] Current user data:', fullUserData);
    console.log('[SettingsPage] User from auth context:', user);
    
    if (params.get('success')) {
      console.log('[SettingsPage] Success param found, starting refresh process...');
      setSuccess('Stripe account connected successfully!');
      
      // First invalidate all relevant queries
      console.log('[SettingsPage] Invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (user?._id) {
        queryClient.invalidateQueries({ queryKey: ['user', user._id] });
      }
      
      // Then refetch the data
      console.log('[SettingsPage] Refetching user data...');
      refetch().then((result) => {
        console.log('[SettingsPage] User data refreshed successfully:', result.data);
        console.log('[SettingsPage] Stripe account ID in refreshed data:', result.data?.stripeAccountId);
        // Force a hard refresh of the page to ensure all components update
        console.log('[SettingsPage] Forcing page reload...');
        window.location.reload();
      }).catch(error => {
        console.error('[SettingsPage] Error refreshing user data:', error);
      });
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        console.log('[SettingsPage] Clearing success message');
        setSuccess(null);
      }, 5000);
    }
  }, [refetch, fullUserData, queryClient, user?._id]);

  // Fetch waiver status for this mentor
  useEffect(() => {
    if (user?.role === 'MENTOR') {
      setWaiverLoading(true);
      setWaiverError(null);
      api.get(`/waivers/verify/${user._id}`)
        .then(res => setWaiverStatus(res.data))
        .catch(() => setWaiverError('Failed to load waiver status'))
        .finally(() => setWaiverLoading(false));
    }
  }, [user]);

  useEffect(() => {
    checkDriveConnection();
  }, []);

  const checkDriveConnection = async () => {
    try {
      const connected = await DriveService.isDriveConnected();
      setIsDriveConnected(connected);
    } catch (error) {
      console.error('Error checking Drive connection:', error);
      setIsDriveConnected(false);
    }
  };

  const handleConnectDrive = async () => {
    try {
      setDriveLoading(true);
      setDriveError(null);
      const authUrl = await DriveService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=600');
      
      // Poll for connection status
      const checkInterval = setInterval(async () => {
        const connected = await DriveService.isDriveConnected();
        if (connected) {
          setIsDriveConnected(true);
          setDriveSuccess(true);
          clearInterval(checkInterval);
          setTimeout(() => setDriveSuccess(false), 3000);
        }
      }, 2000);

      // Clear interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      setDriveError('Failed to connect to Google Drive');
    } finally {
      setDriveLoading(false);
    }
  };

  const allowTwoApprentices = fullUserData?.role === 'MENTOR'
    && ratingSummary.count >= 5
    && ratingSummary.average >= 4.5;

  const handleToggle = async (field, value) => {
    await updateProfile({ [field]: value });
    refetch();
    queryClient.invalidateQueries({ queryKey: ['me'] });
    if (fullUserData?._id) {
      queryClient.invalidateQueries({ queryKey: ['user', fullUserData._id] });
    }
  };

  const handleNoticeSave = async () => {
    setNoticeLoading(true);
    setNoticeError(null);
    setNoticeSuccess(false);
    if (!Number.isInteger(noticeDays) || noticeDays < 1 || noticeDays > 90) {
      setNoticeError('Please enter a number between 1 and 90.');
      setNoticeLoading(false);
      return;
    }
    try {
      await updateProfile({ preferredNoticeDays: noticeDays });
      setNoticeSuccess(true);
      refetch();
    } catch (err) {
      setNoticeError('Failed to save. Please try again.');
    } finally {
      setNoticeLoading(false);
    }
  };

  const handlePrepChange = async (newRequirements) => {
    setPrepRequirements(newRequirements);
    setPrepLoading(true);
    setPrepError(null);
    setPrepSuccess(false);
    try {
      await updateProfile({ prepRequirements: newRequirements });
      setPrepSuccess(true);
      refetch();
      setTimeout(() => setPrepSuccess(false), 1200);
    } catch (err) {
      setPrepError('Failed to save. Please try again.');
    } finally {
      setPrepLoading(false);
    }
  };

  const handleInvolvementChange = async (val) => {
    setExpectedMenteeInvolvement(val);
    setInvolvementLoading(true);
    setInvolvementError(null);
    setInvolvementSuccess(false);
    try {
      await updateProfile({ expectedMenteeInvolvement: val });
      setInvolvementSuccess(true);
      refetch();
      setTimeout(() => setInvolvementSuccess(false), 1200);
    } catch (err) {
      setInvolvementError('Failed to save. Please try again.');
    } finally {
      setInvolvementLoading(false);
    }
  };

  const handlePrepSupportFeeSave = async () => {
    setFeeLoading(true);
    setFeeError(null);
    setFeeSuccess(false);
    try {
      await updateProfile({ prepSupportFee: Number(prepSupportFee), feeCurrency: 'CAD' });
      setFeeSuccess(true);
      refetch();
      setTimeout(() => setFeeSuccess(false), 1200);
    } catch (err) {
      setFeeError('Failed to save. Please try again.');
    } finally {
      setFeeLoading(false);
    }
  };

  const handleCancellationPolicySave = async () => {
    setCancellationLoading(true);
    setCancellationError(null);
    setCancellationSuccess(false);
    try {
      await updateProfile({ cancellationPolicyHours });
      setCancellationSuccess(true);
      refetch();
      setTimeout(() => setCancellationSuccess(false), 1200);
    } catch (err) {
      setCancellationError('Failed to save. Please try again.');
    } finally {
      setCancellationLoading(false);
    }
  };

  const handleMaxApprenticesSave = async () => {
    setMaxApprenticesLoading(true);
    setMaxApprenticesError(null);
    setMaxApprenticesSuccess(false);
    try {
      await updateProfile({ maxApprentices });
      setMaxApprenticesSuccess(true);
      refetch();
      setTimeout(() => setMaxApprenticesSuccess(false), 1200);
    } catch (err) {
      setMaxApprenticesError('Failed to save. Please try again.');
    } finally {
      setMaxApprenticesLoading(false);
    }
  };

  const handleLanguagesSave = async () => {
    setLanguagesLoading(true);
    setLanguagesError(null);
    setLanguagesSuccess(false);
    try {
      await updateProfile({ languages: languages.map(l => l.value) });
      setLanguagesSuccess(true);
      refetch();
      setTimeout(() => setLanguagesSuccess(false), 1200);
    } catch (err) {
      setLanguagesError('Failed to save. Please try again.');
    } finally {
      setLanguagesLoading(false);
    }
  };

  const handleTaxSave = async () => {
    setTaxLoading(true);
    setTaxError(null);
    setTaxSuccess(false);

    // Validate HST number if collectsHST is true
    if (collectsHST) {
      // HST number format: 123456789RT0001
      const hstRegex = /^\d{9}RT\d{4}$/;
      if (!taxId || !hstRegex.test(taxId)) {
        setTaxError('Please enter a valid HST number (format: 123456789RT0001)');
        setTaxLoading(false);
        return;
      }
    }

    try {
      await updateProfile({ collectsHST, taxId });
      setTaxSuccess(true);
      refetch();
      setTimeout(() => setTaxSuccess(false), 1200);
    } catch (err) {
      setTaxError('Failed to save. Please try again.');
    } finally {
      setTaxLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    setPwLoading(true);
    try {
      // Call backend endpoint to update password (implement as needed)
      await axios.patch('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleAddWorkplace = async () => {
    if (!newWorkplace.trim()) return;
    
    setWorkplacesLoading(true);
    setWorkplacesError(null);
    setWorkplacesSuccess(false);
    
    try {
      const updatedWorkplaces = [...workplaces, newWorkplace.trim()];
      await updateProfile({ workplaces: updatedWorkplaces });
      setWorkplaces(updatedWorkplaces);
      setNewWorkplace('');
      setWorkplacesSuccess(true);
      refetch();
      setTimeout(() => setWorkplacesSuccess(false), 1500);
    } catch (err) {
      setWorkplacesError('Failed to save workplace. Please try again.');
    } finally {
      setWorkplacesLoading(false);
    }
  };

  const handleRemoveWorkplace = async (index) => {
    setWorkplacesLoading(true);
    setWorkplacesError(null);
    setWorkplacesSuccess(false);
    
    try {
      const updatedWorkplaces = [...workplaces];
      updatedWorkplaces.splice(index, 1);
      await updateProfile({ workplaces: updatedWorkplaces });
      setWorkplaces(updatedWorkplaces);
      setWorkplacesSuccess(true);
      refetch();
      setTimeout(() => setWorkplacesSuccess(false), 1500);
    } catch (err) {
      setWorkplacesError('Failed to remove workplace. Please try again.');
    } finally {
      setWorkplacesLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddWorkplace();
    }
  };

  const handleEnablePayouts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('/api/stripe/create-oauth-link', {
        state: user._id
      });
      window.location.href = response.data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable payouts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaiverSigned = (signedWaiverId) => {
    setShowWaiverModal(false);
    setWaiverStatus({ hasSigned: true, signedAt: new Date(), waiverId: signedWaiverId });
  };

  const handleDownloadWaiver = async () => {
    if (!waiverStatus.waiverId) return;
    try {
      const response = await api.get(`/waivers/${waiverStatus.waiverId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MentorConnect-Waiver-${waiverStatus.waiverId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download waiver PDF.');
    }
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }

  const isDeveloper = user?.email === 'pedramghafoori@hotmail.com';
  const filteredMenuItems = isDeveloper
    ? menuItems
    : menuItems.filter(item => item.key !== 'certification');

  return (
    <div style={{ background: '#fafbfc', minHeight: '80vh' }}>
      <Container style={{ display: 'flex', minHeight: '80vh' }}>
        {/* Sidebar for desktop only */}
        {!isMobile && (
          <aside className="settings-sidebar">
            <nav>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredMenuItems.map(item => (
                  <li key={item.key}>
                    <button
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '1rem 2rem',
                        background: selected === item.key ? '#f3f4f6' : 'none',
                        border: 'none',
                        textAlign: 'left',
                        fontWeight: selected === item.key ? 700 : 500,
                        color: selected === item.key ? '#d33' : '#222',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelected(item.key)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
        <main style={{ flex: 1, padding: '2.5rem 3rem' }}>
          {isMobile ? (
            <>
              {/* Privacy Section */}
              {(selected === 'privacy' || isMobile) && (
                <section className="settings-section-privacy settings-section">
                  <h2 className="settings-section-title">Privacy</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Profile Visibility</h3>
                    <div className="flex flex-col gap-1 max-w-md settings-toggle-list">
                      <div className="flex items-center justify-between">
                        <span>Show LSS ID</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${showLssId ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setShowLssId(!showLssId); handleToggle('showLssId', !showLssId); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${showLssId ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Show Connections</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${showConnections ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setShowConnections(!showConnections); handleToggle('showConnections', !showConnections); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${showConnections ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Discovery Preferences</h3>
                    <div className="flex flex-col gap-1 max-w-md settings-toggle-list">
                      <div className="flex items-center justify-between">
                        <span>Allow my profile to be featured</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${allowFeatured ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setAllowFeatured(!allowFeatured); handleToggle('allowFeatured', !allowFeatured); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${allowFeatured ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Allow my profile to be searchable</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${allowSearch ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setAllowSearch(!allowSearch); handleToggle('allowSearch', !allowSearch); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${allowSearch ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Tax Section */}
              {(selected === 'tax' || isMobile) && (
                <section className="settings-section-tax settings-section">
                  <h2 className="settings-section-title">Tax and Payout</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Tax Information</h3>
                    <div className="flex flex-col gap-6 max-w-md">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            id="collectsHST"
                            checked={collectsHST}
                            onChange={(e) => setCollectsHST(e.target.checked)}
                            className="w-4 h-4 text-[#d33] border-gray-300 rounded focus:ring-[#d33]"
                          />
                          <label htmlFor="collectsHST" className="font-medium text-base">
                            I am required to collect HST/GST
                          </label>
                        </div>
                        {collectsHST && (
                          <div className="mt-4">
                            <label className="block font-medium text-base mb-2">
                              Tax ID
                              <input
                                type="text"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="Enter your HST/GST number"
                                className="block mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#d33] focus:border-[#d33] text-lg"
                                style={{ fontSize: '1.1rem' }}
                                disabled={taxLoading}
                              />
                            </label>
                          </div>
                        )}
                        <button
                          onClick={handleTaxSave}
                          disabled={taxLoading}
                          className="mt-4 px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                        >
                          {taxLoading ? 'Saving...' : 'Save'}
                        </button>
                        {taxError && <div className="text-red-500 text-sm mt-1">{taxError}</div>}
                        {taxSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                      </div>
                    </div>
                  </div>
                  {fullUserData?.role === 'MENTOR' && (
                    <div className="settings-subsection mt-8">
                      <h3 className="settings-subsection-title">Payout Settings</h3>
                      <div className="flex flex-col gap-4 max-w-md">
                        {fullUserData?.stripeAccountId ? (
                          <div className="flex items-center gap-2">
                            <span className="badge badge-success">Payouts enabled</span>
                            <span className="text-sm text-gray-600">Your Stripe account is connected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                              Connect your Stripe account to receive payouts for your mentoring sessions.
                            </p>
                            <button
                              onClick={handleEnablePayouts}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                            >
                              {isLoading ? 'Processing...' : 'Enable payouts'}
                            </button>
                            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Connections Section */}
              {(selected === 'connections' || isMobile) && (
                <section className="settings-section-connections settings-section">
                  <h2 className="settings-section-title">Connections</h2>
                  
                  {/* Google Drive Connection */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Google Drive Integration</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      {isDriveConnected === null ? (
                        <div>Checking Drive connection...</div>
                      ) : isDriveConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓ Connected to Google Drive</span>
                          <button
                            onClick={handleConnectDrive}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Reconnect
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-gray-600">
                            Connect your Google Drive to enable file sharing and collaboration features.
                          </p>
                          <button
                            onClick={handleConnectDrive}
                            disabled={driveLoading}
                            className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                          >
                            {driveLoading ? 'Connecting...' : 'Connect Google Drive'}
                          </button>
                        </div>
                      )}
                      {driveError && <div className="text-red-500 text-sm mt-1">{driveError}</div>}
                      {driveSuccess && <div className="text-green-600 text-sm mt-1">Successfully connected to Google Drive!</div>}
                    </div>
                  </div>

                  {/* Stripe Connection */}
                  {fullUserData?.role === 'MENTOR' && (
                    <div className="settings-subsection">
                      <h3 className="settings-subsection-title">Stripe Integration</h3>
                      <div className="flex flex-col gap-4 max-w-md">
                        {fullUserData?.stripeAccountId ? (
                          <div className="flex items-center gap-2">
                            <span className="badge badge-success">Payouts enabled</span>
                            <span className="text-sm text-gray-600">Your Stripe account is connected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                              Connect your Stripe account to receive payouts for your mentoring sessions.
                            </p>
                            <button
                              onClick={handleEnablePayouts}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                            >
                              {isLoading ? 'Processing...' : 'Enable payouts'}
                            </button>
                            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Account Settings Section */}
              {(selected === 'account' || isMobile) && (
                <section className="settings-section-account settings-section">
                  <h2 className="settings-section-title">Account Settings</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Languages Spoken</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      <Select
                        isMulti
                        options={LANGUAGES}
                        value={languages}
                        onChange={setLanguages}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select languages..."
                        isDisabled={languagesLoading}
                      />
                      <button
                        onClick={handleLanguagesSave}
                        disabled={languagesLoading}
                        className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit mt-2"
                      >
                        {languagesLoading ? 'Saving...' : 'Save'}
                      </button>
                      {languagesError && <div className="text-red-500 text-sm mt-1">{languagesError}</div>}
                      {languagesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Workplaces</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newWorkplace}
                          onChange={e => setNewWorkplace(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Add a workplace..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                          disabled={workplacesLoading}
                        />
                        <button
                          onClick={handleAddWorkplace}
                          disabled={workplacesLoading || !newWorkplace.trim()}
                          className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="list-disc pl-5 mt-2">
                        {workplaces.map((wp, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span>{wp}</span>
                            <button
                              onClick={() => handleRemoveWorkplace(idx)}
                              className="ml-2 text-red-500 hover:text-red-700 text-sm"
                              disabled={workplacesLoading}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                      {workplacesError && <div className="text-red-500 text-sm mt-1">{workplacesError}</div>}
                      {workplacesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Change Password</h3>
                    <form
                      onSubmit={handlePasswordUpdate}
                      style={{ maxWidth: 400 }}
                    >
                      <label className="block font-medium mb-2">Email (username)
                        <input
                          type="email"
                          value={fullUserData?.email || ''}
                          disabled
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-lg mb-4 mt-1"
                        />
                      </label>
                      <label className="block font-medium mb-2">Current Password
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg mb-2 mt-1"
                            required
                          />
                          <span
                            onClick={() => setShowCurrentPw(v => !v)}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#b32' }}
                          >
                            {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </label>
                      <label className="block font-medium mb-2">New Password
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg mb-2 mt-1"
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={pwLoading || !currentPassword || !newPassword}
                        className="settings-fee-save-btn px-5 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                      >
                        {pwLoading ? 'Saving...' : 'Update Password'}
                      </button>
                      {pwError && <div className="text-red-500 text-sm mt-1">{pwError}</div>}
                      {pwSuccess && <div className="text-green-600 text-sm mt-1">Password updated!</div>}
                    </form>
                  </div>
                  <AccountDangerZone />
                </section>
              )}

              {/* Agreements Section */}
              {(selected === 'agreements' || isMobile) && (
                <section className="settings-section-agreements settings-section">
                  <h2 className="settings-section-title">Agreements</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Mentor Agreement</h3>
                    <div className="flex flex-col gap-4 max-w-2xl">
                      {waiverStatus?.signed ? (
                        <div className="flex flex-col gap-4">
                          <div className="badge badge-success w-fit">Signed on {waiverStatus.signedAt ? format(new Date(waiverStatus.signedAt), 'MMMM d, yyyy') : ''}</div>
                          <button
                            className="btn btn-primary w-fit"
                            onClick={handleDownloadWaiver}
                          >
                            Download Signed Agreement
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 max-w-2xl">
                          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                            Please review and sign the Mentor Agreement to continue using the platform as a mentor.
                          </div>
                          <button
                            className="btn btn-primary w-fit"
                            onClick={() => setShowWaiverModal(true)}
                          >
                            Agree and Sign
                          </button>
                        </div>
                      )}
                      <WaiverModal
                        isOpen={showWaiverModal}
                        onClose={() => setShowWaiverModal(false)}
                        onSigned={handleWaiverSigned}
                      />
                      {waiverError && <div className="alert alert-error mt-2">{waiverError}</div>}
                    </div>
                    <div className="settings-subsection mt-8">
                      <SignedWaivers />
                    </div>
                  </div>
                </section>
              )}

              {/* Certification Management Section (developer only) */}
              {isDeveloper && (
                <>
                  <hr className="settings-section-divider" />
                  <section className="settings-section settings-section">
                    <h2 className="settings-section-title">Certification Management</h2>
                    <CertificationManager />
                  </section>
                </>
              )}
            </>
          ) : (
            <>
              {/* Privacy Section */}
              {selected === 'privacy' && (
                <section className="settings-section-privacy settings-section">
                  <h2 className="settings-section-title">Privacy</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Profile Visibility</h3>
                    <div className="flex flex-col gap-1 max-w-md settings-toggle-list">
                      <div className="flex items-center justify-between">
                        <span>Show LSS ID</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${showLssId ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setShowLssId(!showLssId); handleToggle('showLssId', !showLssId); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${showLssId ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Show Connections</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${showConnections ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setShowConnections(!showConnections); handleToggle('showConnections', !showConnections); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${showConnections ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Discovery Preferences</h3>
                    <div className="flex flex-col gap-1 max-w-md settings-toggle-list">
                      <div className="flex items-center justify-between">
                        <span>Allow my profile to be featured</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${allowFeatured ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setAllowFeatured(!allowFeatured); handleToggle('allowFeatured', !allowFeatured); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${allowFeatured ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Allow my profile to be searchable</span>
                        <button
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${allowSearch ? 'bg-[#d33]' : 'bg-gray-300'}`}
                          onClick={() => { setAllowSearch(!allowSearch); handleToggle('allowSearch', !allowSearch); }}
                        >
                          <span className={`h-4 w-4 bg-white rounded-full shadow transform transition-transform duration-200 ${allowSearch ? 'translate-x-4' : ''}`}></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Tax Section */}
              {selected === 'tax' && (
                <section className="settings-section-tax settings-section">
                  <h2 className="settings-section-title">Tax and Payout</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Tax Information</h3>
                    <div className="flex flex-col gap-6 max-w-md">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            id="collectsHST"
                            checked={collectsHST}
                            onChange={(e) => setCollectsHST(e.target.checked)}
                            className="w-4 h-4 text-[#d33] border-gray-300 rounded focus:ring-[#d33]"
                          />
                          <label htmlFor="collectsHST" className="font-medium text-base">
                            I am required to collect HST/GST
                          </label>
                        </div>
                        {collectsHST && (
                          <div className="mt-4">
                            <label className="block font-medium text-base mb-2">
                              Tax ID
                              <input
                                type="text"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                placeholder="Enter your HST/GST number"
                                className="block mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#d33] focus:border-[#d33] text-lg"
                                style={{ fontSize: '1.1rem' }}
                                disabled={taxLoading}
                              />
                            </label>
                          </div>
                        )}
                        <button
                          onClick={handleTaxSave}
                          disabled={taxLoading}
                          className="mt-4 px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                        >
                          {taxLoading ? 'Saving...' : 'Save'}
                        </button>
                        {taxError && <div className="text-red-500 text-sm mt-1">{taxError}</div>}
                        {taxSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                      </div>
                    </div>
                  </div>
                  {fullUserData?.role === 'MENTOR' && (
                    <div className="settings-subsection mt-8">
                      <h3 className="settings-subsection-title">Payout Settings</h3>
                      <div className="flex flex-col gap-4 max-w-md">
                        {fullUserData?.stripeAccountId ? (
                          <div className="flex items-center gap-2">
                            <span className="badge badge-success">Payouts enabled</span>
                            <span className="text-sm text-gray-600">Your Stripe account is connected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                              Connect your Stripe account to receive payouts for your mentoring sessions.
                            </p>
                            <button
                              onClick={handleEnablePayouts}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                            >
                              {isLoading ? 'Processing...' : 'Enable payouts'}
                            </button>
                            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Connections Section */}
              {selected === 'connections' && (
                <section className="settings-section-connections settings-section">
                  <h2 className="settings-section-title">Connections</h2>
                  
                  {/* Google Drive Connection */}
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Google Drive Integration</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      {isDriveConnected === null ? (
                        <div>Checking Drive connection...</div>
                      ) : isDriveConnected ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓ Connected to Google Drive</span>
                          <button
                            onClick={handleConnectDrive}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Reconnect
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <p className="text-gray-600">
                            Connect your Google Drive to enable file sharing and collaboration features.
                          </p>
                          <button
                            onClick={handleConnectDrive}
                            disabled={driveLoading}
                            className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                          >
                            {driveLoading ? 'Connecting...' : 'Connect Google Drive'}
                          </button>
                        </div>
                      )}
                      {driveError && <div className="text-red-500 text-sm mt-1">{driveError}</div>}
                      {driveSuccess && <div className="text-green-600 text-sm mt-1">Successfully connected to Google Drive!</div>}
                    </div>
                  </div>

                  {/* Stripe Connection */}
                  {fullUserData?.role === 'MENTOR' && (
                    <div className="settings-subsection">
                      <h3 className="settings-subsection-title">Stripe Integration</h3>
                      <div className="flex flex-col gap-4 max-w-md">
                        {fullUserData?.stripeAccountId ? (
                          <div className="flex items-center gap-2">
                            <span className="badge badge-success">Payouts enabled</span>
                            <span className="text-sm text-gray-600">Your Stripe account is connected</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                              Connect your Stripe account to receive payouts for your mentoring sessions.
                            </p>
                            <button
                              onClick={handleEnablePayouts}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                            >
                              {isLoading ? 'Processing...' : 'Enable payouts'}
                            </button>
                            {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                            {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Account Settings Section */}
              {selected === 'account' && (
                <section className="settings-section-account settings-section">
                  <h2 className="settings-section-title">Account Settings</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Languages Spoken</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      <Select
                        isMulti
                        options={LANGUAGES}
                        value={languages}
                        onChange={setLanguages}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select languages..."
                        isDisabled={languagesLoading}
                      />
                      <button
                        onClick={handleLanguagesSave}
                        disabled={languagesLoading}
                        className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit mt-2"
                      >
                        {languagesLoading ? 'Saving...' : 'Save'}
                      </button>
                      {languagesError && <div className="text-red-500 text-sm mt-1">{languagesError}</div>}
                      {languagesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Workplaces</h3>
                    <div className="flex flex-col gap-2 max-w-md">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newWorkplace}
                          onChange={e => setNewWorkplace(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Add a workplace..."
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                          disabled={workplacesLoading}
                        />
                        <button
                          onClick={handleAddWorkplace}
                          disabled={workplacesLoading || !newWorkplace.trim()}
                          className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                        >
                          Add
                        </button>
                      </div>
                      <ul className="list-disc pl-5 mt-2">
                        {workplaces.map((wp, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span>{wp}</span>
                            <button
                              onClick={() => handleRemoveWorkplace(idx)}
                              className="ml-2 text-red-500 hover:text-red-700 text-sm"
                              disabled={workplacesLoading}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                      {workplacesError && <div className="text-red-500 text-sm mt-1">{workplacesError}</div>}
                      {workplacesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                    </div>
                  </div>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Change Password</h3>
                    <form
                      onSubmit={handlePasswordUpdate}
                      style={{ maxWidth: 400 }}
                    >
                      <label className="block font-medium mb-2">Email (username)
                        <input
                          type="email"
                          value={fullUserData?.email || ''}
                          disabled
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-lg mb-4 mt-1"
                        />
                      </label>
                      <label className="block font-medium mb-2">Current Password
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg mb-2 mt-1"
                            required
                          />
                          <span
                            onClick={() => setShowCurrentPw(v => !v)}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#b32' }}
                          >
                            {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                          </span>
                        </div>
                      </label>
                      <label className="block font-medium mb-2">New Password
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-lg mb-2 mt-1"
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={pwLoading || !currentPassword || !newPassword}
                        className="settings-fee-save-btn px-5 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                      >
                        {pwLoading ? 'Saving...' : 'Update Password'}
                      </button>
                      {pwError && <div className="text-red-500 text-sm mt-1">{pwError}</div>}
                      {pwSuccess && <div className="text-green-600 text-sm mt-1">Password updated!</div>}
                    </form>
                  </div>
                  <AccountDangerZone />
                </section>
              )}

              {/* Agreements Section */}
              {selected === 'agreements' && (
                <section className="settings-section-agreements settings-section">
                  <h2 className="settings-section-title">Agreements</h2>
                  <div className="settings-subsection">
                    <h3 className="settings-subsection-title">Mentor Agreement</h3>
                    <div className="flex flex-col gap-4 max-w-2xl">
                      {waiverStatus?.signed ? (
                        <div className="flex flex-col gap-4">
                          <div className="badge badge-success w-fit">Signed on {waiverStatus.signedAt ? format(new Date(waiverStatus.signedAt), 'MMMM d, yyyy') : ''}</div>
                          <button
                            className="btn btn-primary w-fit"
                            onClick={handleDownloadWaiver}
                          >
                            Download Signed Agreement
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 max-w-2xl">
                          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                            Please review and sign the Mentor Agreement to continue using the platform as a mentor.
                          </div>
                          <button
                            className="btn btn-primary w-fit"
                            onClick={() => setShowWaiverModal(true)}
                          >
                            Agree and Sign
                          </button>
                        </div>
                      )}
                      <WaiverModal
                        isOpen={showWaiverModal}
                        onClose={() => setShowWaiverModal(false)}
                        onSigned={handleWaiverSigned}
                      />
                      {waiverError && <div className="alert alert-error mt-2">{waiverError}</div>}
                    </div>
                    <div className="settings-subsection mt-8">
                      <SignedWaivers />
                    </div>
                  </div>
                </section>
              )}

              {/* Certification Management Section (developer only) */}
              {isDeveloper && selected === 'certification' && (
                <section className="settings-section settings-section">
                  <h2 className="settings-section-title">Certification Management</h2>
                  <CertificationManager />
                </section>
              )}
            </>
          )}
        </main>
      </Container>
    </div>
  );
} 