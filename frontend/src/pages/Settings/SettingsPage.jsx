import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../features/profile/updateProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../../features/profile/getProfile';
import Select from 'react-select';
import Container from '../../components/Container';
import '../../css/settings.css';

const menuItems = [
  { key: 'mentor', label: 'Mentor Preferences' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'tax', label: 'Tax and Payout' },
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

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'fa', label: 'Persian' },
  { value: 'tr', label: 'Turkish' },
  { value: 'nl', label: 'Dutch' },
  { value: 'pl', label: 'Polish' },
  { value: 'sv', label: 'Swedish' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'he', label: 'Hebrew' },
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
          LANGUAGE_OPTIONS.find(opt => opt.value === code) || { value: code, label: code }
        )
      );
    }
  }, [fullUserData]);

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

  return (
    <div style={{ background: '#fafbfc', minHeight: '80vh' }}>
      <Container style={{ display: 'flex', minHeight: '80vh' }}>
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
          {selected === 'mentor' && (
            <section className="settings-section-mentor settings-section">
              <h2 className="settings-section-title">Mentor Preferences</h2>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Scheduling</h3>
                <label className="font-medium text-base mb-1">
                  How many days' notice do you need before mentoring?
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={noticeDays}
                    onChange={e => setNoticeDays(Number(e.target.value))}
                    className="settings-input-number"
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
              </div>
              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Preparation</h3>
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
                <div>
                  <div className="font-medium text-base mb-2">How late can a mentee cancel and still get a refund?</div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      min={1}
                      max={168}
                      value={cancellationPolicyHours}
                      onChange={e => setCancellationPolicyHours(Number(e.target.value))}
                      className="settings-input-number"
                    />
                    <span>hours</span>
                    <button
                      onClick={handleCancellationPolicySave}
                      disabled={cancellationLoading}
                      className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                    >
                      {cancellationLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {cancellationError && <div className="text-red-500 text-sm mt-1">{cancellationError}</div>}
                  {cancellationSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                  <div className="text-xs text-gray-500 mt-1">Free cancellation up to {cancellationPolicyHours} h before start</div>
                </div>
                <div>
                  <div className="font-medium text-base mb-2">How many apprentices can you handle at once?</div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxApprentices}
                      onChange={e => setMaxApprentices(Number(e.target.value))}
                      className="settings-input-number"
                    />
                    <button
                      onClick={handleMaxApprenticesSave}
                      disabled={maxApprenticesLoading}
                      className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                    >
                      {maxApprenticesLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {maxApprenticesError && <div className="text-red-500 text-sm mt-1">{maxApprenticesError}</div>}
                  {maxApprenticesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
                </div>
                <div>
                  <div className="font-medium text-base mb-2">Languages you speak</div>
                  <div className="mb-3" style={{ maxWidth: 400 }}>
                    <Select
                      isMulti
                      options={LANGUAGE_OPTIONS}
                      value={languages}
                      onChange={setLanguages}
                      isDisabled={languagesLoading}
                      placeholder="Select languages..."
                    />
                  </div>
                  <button
                    onClick={handleLanguagesSave}
                    disabled={languagesLoading}
                    className="px-4 py-2 rounded-full bg-[#d33] text-white font-semibold hover:bg-[#b32] transition disabled:opacity-60"
                  >
                    {languagesLoading ? 'Saving...' : 'Save'}
                  </button>
                  {languagesError && <div className="text-red-500 text-sm mt-1">{languagesError}</div>}
                  {languagesSuccess && <div className="text-green-600 text-sm mt-1">Saved!</div>}
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
            </section>
          )}
        </main>
      </Container>
    </div>
  );
} 