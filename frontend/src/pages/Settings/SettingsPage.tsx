import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../features/profile/updateProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../features/profile/getProfile';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';

const menuItems = [
  { key: 'mentor', label: 'Mentor Preferences' },
  { key: 'privacy', label: 'Privacy' },
];

const PREP_OPTIONS = [
  { value: 'lesson-plan', label: 'Lesson Plan' },
  { value: 'exam-plan', label: 'Exam Plan' },
  { value: 'scenarios', label: 'Scenarios' },
  { value: 'must-sees', label: 'Must-Sees' },
];

const INVOLVEMENT_OPTIONS = [
  { value: 'full-course', label: 'Full Course' },
  { value: 'exam-only', label: 'Exam Only' },
];

export default function SettingsPage() {
  const [selected, setSelected] = useState('privacy');
  const queryClient = useQueryClient();
  const { data: fullUserData, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
  });
  const [showLssId, setShowLssId] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
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

  useEffect(() => {
    if (fullUserData) {
      setShowLssId(!!fullUserData.showLssId);
      setShowConnections(!!fullUserData.showConnections);
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

  const handleToggle = async (field: 'showLssId' | 'showConnections', value: boolean) => {
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
      await fetch('/api/mentor/notice-days', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredNoticeDays: noticeDays }),
      });
      setNoticeSuccess(true);
      refetch();
    } catch (err) {
      setNoticeError('Failed to save. Please try again.');
    } finally {
      setNoticeLoading(false);
    }
  };

  // Prep Requirements save on change
  const handlePrepChange = async (newRequirements) => {
    setPrepRequirements(newRequirements);
    setPrepLoading(true);
    setPrepError(null);
    setPrepSuccess(false);
    try {
      // Use the same method as the profile page: PATCH /users/me
      const api = (await import('../../lib/api')).default;
      await api.patch('/users/me', { prepRequirements: newRequirements });
      setPrepSuccess(true);
      refetch();
      setTimeout(() => setPrepSuccess(false), 1200);
    } catch (err) {
      setPrepError('Failed to save. Please try again.');
    } finally {
      setPrepLoading(false);
    }
  };

  // Involvement save on change
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
      const api = (await import('../../lib/api')).default;
      await api.put('/mentor/prep-support-fee', { prepSupportFee: Number(prepSupportFee), feeCurrency: 'CAD' });
      setFeeSuccess(true);
      refetch();
      setTimeout(() => setFeeSuccess(false), 1200);
    } catch (err) {
      setFeeError('Failed to save. Please try again.');
    } finally {
      setFeeLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', background: '#fafbfc' }}>
      <aside style={{ width: 220, background: '#fff', borderRight: '1px solid #eee', padding: '2rem 0' }}>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map(item => (
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
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Privacy</h2>
            <div className="flex flex-col gap-4 max-w-md">
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
          </section>
        )}
        {selected === 'mentor' && (
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Mentor Preferences</h2>
            <div className="flex flex-col gap-6 max-w-md">
              <label className="font-medium text-base mb-1">
                How many days' notice do you need before mentoring?
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={noticeDays}
                  onChange={e => setNoticeDays(Number(e.target.value))}
                  className="block mt-2 w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#d33] focus:border-[#d33] text-lg"
                  style={{ fontSize: '1.1rem' }}
                />
              </label>
              <button
                onClick={handleNoticeSave}
                disabled={noticeLoading}
                className="px-5 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60 w-fit"
              >
                {noticeLoading ? 'Saving...' : 'Save'}
              </button>
              {noticeError && <div className="text-red-500 text-sm mt-1">{noticeError}</div>}
              {noticeSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}

              {/* Prep Requirements Pills Multi-Select */}
              <div>
                <div className="font-medium text-base mb-2">What mentee must prepare</div>
                <div className="flex flex-wrap gap-2 mb-3">
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

              {/* Expected Mentee Involvement Section */}
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

              {/* Mentor Prep Support Fee */}
              <div>
                <div className="font-medium text-base mb-2">Additional mentor fee (optional)</div>
                <div className="flex items-center gap-2 mb-3">
                  <span>CAD</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="^\\d*(\\.\\d{0,2})?$"
                    value={prepSupportFee}
                    onChange={e => {
                      const val = e.target.value;
                      // Only allow numbers and decimals
                      if (/^\d*(\.\d{0,2})?$/.test(val) || val === "") {
                        setPrepSupportFee(val);
                      }
                    }}
                    className="block w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-[#d33] focus:border-[#d33] text-lg"
                    style={{ fontSize: '1.1rem' }}
                    disabled={feeLoading}
                  />
                  <button
                    onClick={handlePrepSupportFeeSave}
                    disabled={feeLoading}
                    className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                  >
                    {feeLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {feeError && <div className="text-red-500 text-sm mt-1">{feeError}</div>}
                {feeSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                <div className="text-xs text-gray-500 mt-1">Covers pre-course reviews & comms</div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
} 