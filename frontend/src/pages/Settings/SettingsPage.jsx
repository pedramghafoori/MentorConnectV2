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

const menuItems = [
  { key: 'mentor', label: 'Mentor Preferences' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'tax', label: 'Tax and Payout' },
  { key: 'account', label: 'Account Settings' },
  { key: 'certification', label: 'Certification Management' },
  { key: 'agreements', label: 'Agreements' },
];

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
  const [noticeDays, setNoticeDays] = useState(7);
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeError, setNoticeError] = useState(null);
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [prepRequirements, setPrepRequirements] = useState([]);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState(null);
  const [prepSuccess, setPrepSuccess] = useState(false);
  const [expectedMenteeInvolvement, setExpectedMenteeInvolvement] = useState('');
  const [involvementLoading, setInvolvementLoading] = useState(false);
  const [involvementError, setInvolvementError] = useState(null);
  const [involvementSuccess, setInvolvementSuccess] = useState(false);
  const [prepSupportFee, setPrepSupportFee] = useState(0);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeError, setFeeError] = useState(null);
  const [feeSuccess, setFeeSuccess] = useState(false);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(48);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  const [cancellationError, setCancellationError] = useState(null);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [maxApprentices, setMaxApprentices] = useState(1);
  const [maxApprenticesLoading, setMaxApprenticesLoading] = useState(false);
  const [maxApprenticesError, setMaxApprenticesError] = useState(null);
  const [maxApprenticesSuccess, setMaxApprenticesSuccess] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [languagesError, setLanguagesError] = useState(null);
  const [languagesSuccess, setLanguagesSuccess] = useState(false);
  const [collectsHST, setCollectsHST] = useState(false);
  const [taxId, setTaxId] = useState('');
  const [taxLoading, setTaxLoading] = useState(false);
  const [taxError, setTaxError] = useState(null);
  const [taxSuccess, setTaxSuccess] = useState(false);
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
    if (fullUserData && typeof fullUserData.preferredNoticeDays === 'number') {
      setNoticeDays(fullUserData.preferredNoticeDays);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && Array.isArray(fullUserData.prepRequirements)) {
      setPrepRequirements(fullUserData.prepRequirements);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && typeof fullUserData.expectedMenteeInvolvement === 'string') {
      setExpectedMenteeInvolvement(fullUserData.expectedMenteeInvolvement);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && typeof fullUserData.prepSupportFee === 'number') {
      setPrepSupportFee(fullUserData.prepSupportFee);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && typeof fullUserData.cancellationPolicyHours === 'number') {
      setCancellationPolicyHours(fullUserData.cancellationPolicyHours);
    }
  }, [fullUserData]);

  useEffect(() => {
    if (fullUserData && typeof fullUserData.maxApprentices === 'number') {
      setMaxApprentices(fullUserData.maxApprentices);
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
    console.log('URL params:', Object.fromEntries(params.entries()));
    console.log('Current user data:', fullUserData);
    
    if (params.get('success')) {
      console.log('Success param found, refreshing user data...');
      setSuccess('Stripe account connected successfully!');
      // Refresh user data to get updated stripeAccountId
      refetch().then(() => {
        console.log('User data refreshed');
      }).catch(error => {
        console.error('Error refreshing user data:', error);
      });
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    }
  }, [refetch, fullUserData]);

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
      const response = await axios.post('/api/stripe/create-oauth-link');
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
        <main style={{ flex: 1, padding: '2.5rem 3rem' }}>
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
          {selected === 'certification' && isDeveloper && (
            <section className="settings-section settings-section">
              <h2 className="settings-section-title">Certification Management</h2>
              <CertificationManager />
            </section>
          )}
          {selected === 'mentor' && (
            <section className="settings-section-mentor settings-section">
              <h2 className="settings-section-title">Mentor Preferences</h2>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Scheduling</h3>
                <div className="settings-fee-input-row">
                  <label className="font-medium text-base mb-1" htmlFor="noticeDays">
                    How many days' notice do you need before mentoring?
                  </label>
                  <div className="settings-input-spinner-row">
                    <button
                      type="button"
                      className="settings-spinner-btn"
                      onClick={() => setNoticeDays(prev => Math.max(1, prev - 1))}
                      tabIndex={-1}
                    >−</button>
                    <input
                      id="noticeDays"
                      type="number"
                      min={1}
                      max={90}
                      value={noticeDays}
                      onChange={e => setNoticeDays(Number(e.target.value))}
                      className="settings-input-number"
                    />
                    <button
                      type="button"
                      className="settings-spinner-btn"
                      onClick={() => setNoticeDays(prev => Math.min(90, prev + 1))}
                      tabIndex={-1}
                    >+</button>
                  </div>
                  <button
                    onClick={handleNoticeSave}
                    disabled={noticeLoading}
                    className="settings-fee-save-btn px-5 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
                  >
                    {noticeLoading ? 'Saving...' : 'Save'}
                  </button>
                  {noticeError && <div className="text-red-500 text-sm mt-1">{noticeError}</div>}
                  {noticeSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                </div>
              </div>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Preparation</h3>
                <div>
                  <div className="font-medium text-base mb-2">What mentee must prepare</div>
                  <div className="flex flex-wrap gap-2 settings-group-spacing">
                    {PREP_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors duration-150 ${prepRequirements.includes(opt.value)
                          ? 'bg-[#d33] text-white border-[#d33] shadow'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                        onClick={() => {
                          const newReqs = prepRequirements.includes(opt.value)
                            ? prepRequirements.filter(v => v !== opt.value)
                            : [...prepRequirements, opt.value];
                          handlePrepChange(newReqs);
                        }}
                        disabled={prepLoading}
                      >
                        {opt.label}
                        {prepLoading && prepRequirements.includes(opt.value) && (
                          <span className="ml-2 animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full align-middle"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  {prepError && <div className="text-red-500 text-sm mt-1">{prepError}</div>}
                  {prepSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                </div>
                <div>
                  <div className="font-medium text-base mb-2">Expected mentee involvement</div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {INVOLVEMENT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors duration-150 ${expectedMenteeInvolvement === opt.value
                          ? 'bg-[#d33] text-white border-[#d33] shadow'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'}`}
                        onClick={() => handleInvolvementChange(opt.value)}
                        disabled={involvementLoading}
                      >
                        {opt.label}
                        {involvementLoading && expectedMenteeInvolvement === opt.value && (
                          <span className="ml-2 animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full align-middle"></span>
                        )}
                      </button>
                    ))}
                  </div>
                  {involvementError && <div className="text-red-500 text-sm mt-1">{involvementError}</div>}
                  {involvementSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                </div>
              </div>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Fees & Capacity</h3>
                <div className="settings-fee-list">
                  <div className="settings-fee-group">
                    <div className="font-medium text-base mb-2">Additional mentor fee (optional)</div>
                    <div className="settings-supporting-text">Covers pre-course reviews & comms</div>
                    <div className="settings-fee-input-row">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          pattern="^\\d*(\\.\\d{0,2})?$"
                          value={prepSupportFee}
                          onChange={e => {
                            const val = e.target.value;
                            if (/^\d*(\.\d{0,2})?$/.test(val) || val === "") {
                              setPrepSupportFee(val);
                            }
                          }}
                          className="block w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#d33] focus:border-[#d33] text-lg"
                          style={{ fontSize: '1.1rem' }}
                          disabled={feeLoading}
                        />
                        <span>CAD</span>
                      </div>
                      <button
                        onClick={handlePrepSupportFeeSave}
                        disabled={feeLoading}
                        className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                      >
                        {feeLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    {feeError && <div className="text-red-500 text-sm mt-1">{feeError}</div>}
                    {feeSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  </div>
                  <div className="settings-fee-group">
                    <div className="font-medium text-base mb-2">How late can a mentee cancel and still get a refund?</div>
                    <div className="settings-supporting-text">
                      Free cancellation up to {cancellationPolicyHours} h before start
                    </div>
                    <div className="settings-fee-input-row">
                      <div className="flex items-center gap-2">
                        <div className="settings-input-spinner-row">
                          <button
                            type="button"
                            className="settings-spinner-btn"
                            onClick={() => setCancellationPolicyHours(prev => Math.max(1, prev - 1))}
                            tabIndex={-1}
                          >−</button>
                          <input
                            type="number"
                            min={1}
                            max={168}
                            value={cancellationPolicyHours}
                            onChange={e => setCancellationPolicyHours(Number(e.target.value))}
                            className="settings-input-number"
                          />
                          <button
                            type="button"
                            className="settings-spinner-btn"
                            onClick={() => setCancellationPolicyHours(prev => Math.min(168, prev + 1))}
                            tabIndex={-1}
                          >+</button>
                        </div>
                        <span>hours</span>
                      </div>
                      <button
                        onClick={handleCancellationPolicySave}
                        disabled={cancellationLoading}
                        className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                      >
                        {cancellationLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    {cancellationError && <div className="text-red-500 text-sm mt-1">{cancellationError}</div>}
                    {cancellationSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  </div>
                  <div className="settings-fee-group">
                    <div className="font-medium text-base mb-2">How many apprentices can you handle at once?</div>
                    {!allowTwoApprentices ? (
                      <p className="text-red-500 text-sm mt-1">
                        To set more than 1 participant, you need at least 5 reviews and a minimum rating of 4.5+.
                      </p>
                    ) : (
                    <div className="settings-fee-input-row">
                      <div className="settings-input-spinner-row">
                        <button
                          type="button"
                          className="settings-spinner-btn"
                          onClick={() => setMaxApprentices(prev => Math.max(1, prev - 1))}
                          tabIndex={-1}
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          max={2}
                          value={maxApprentices}
                          onChange={e => setMaxApprentices(Number(e.target.value))}
                          className="settings-input-number"
                        />
                        <button
                          type="button"
                          className="settings-spinner-btn"
                          onClick={() => setMaxApprentices(prev => Math.min(2, prev + 1))}
                          tabIndex={-1}
                        >+</button>
                      </div>
                      <button
                        onClick={handleMaxApprenticesSave}
                        disabled={!allowTwoApprentices || maxApprenticesLoading}
                        className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                      >
                        {maxApprenticesLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    )}
                    {maxApprenticesError && <div className="text-red-500 text-sm mt-1">{maxApprenticesError}</div>}
                    {maxApprenticesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  </div>
                  <div className="settings-fee-group">
                    <div className="font-medium text-base mb-2">Languages you speak</div>
                    <div className="mb-3" style={{ maxWidth: 400 }}>
                      <Select
                        isMulti
                        options={LANGUAGES}
                        value={languages}
                        onChange={setLanguages}
                        isDisabled={languagesLoading}
                        placeholder="Select languages..."
                      />
                    </div>
                    <button
                      onClick={handleLanguagesSave}
                      disabled={languagesLoading}
                      className="settings-fee-save-btn px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                    >
                      {languagesLoading ? 'Saving...' : 'Save'}
                    </button>
                    {languagesError && <div className="text-red-500 text-sm mt-1">{languagesError}</div>}
                    {languagesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  </div>
                  <div className="settings-fee-group">
                    <div className="font-medium text-base mb-2">Places you've taught</div>
                    <div className="mb-3" style={{ maxWidth: 400 }}>
                      <div className="flex flex-col gap-2">
                        {workplaces.map((workplace, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                            <span>{workplace}</span>
                            <button 
                              onClick={() => handleRemoveWorkplace(index)}
                              className="text-gray-500 hover:text-red-500"
                              disabled={workplacesLoading}
                              aria-label="Remove workplace"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                        
                        <div className="flex mt-2">
                          <input
                            type="text"
                            value={newWorkplace}
                            onChange={(e) => setNewWorkplace(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add workplace and press Enter"
                            className="block flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-[#d33] focus:border-[#d33]"
                            disabled={workplacesLoading}
                          />
                          <button
                            onClick={handleAddWorkplace}
                            disabled={!newWorkplace.trim() || workplacesLoading}
                            className="px-4 py-2 rounded-r-md bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                    {workplacesError && <div className="text-red-500 text-sm mt-1">{workplacesError}</div>}
                    {workplacesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  </div>
                </div>
              </div>
            </section>
          )}
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
          {selected === 'account' && (
            <section className="settings-section-account settings-section">
              <h2 className="settings-section-title">Account Settings</h2>
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
          {selected === 'agreements' && (
            <section className="settings-section-agreements settings-section">
              <h2 className="settings-section-title">Agreements</h2>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Mentor Agreement</h3>
                {waiverLoading ? (
                  <div>Loading waiver status...</div>
                ) : waiverStatus.hasSigned ? (
                  <div className="flex flex-col gap-3">
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
                      {/* Show a preview or the full waiver text here. For now, just a placeholder. */}
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
            </section>
          )}
        </main>
      </Container>
    </div>
  );
} 