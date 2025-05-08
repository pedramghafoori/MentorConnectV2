import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PropTypes from 'prop-types';
import { getProfile } from '../../features/profile/getProfile';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/calendar.css";
import api from '../../lib/api';

const COURSE_OPTIONS = [
  'Bronze',
  'Standard First Aid',
  'National Lifeguard',
  'Lifesaving IT',
  'First Aid IT',
  'NL IT'
];

const CreateCourseModal = ({ isOpen, onClose, initialOpportunity }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [mentorSettings, setMentorSettings] = useState({
    prepSupportFee: 0,
    maxApprentices: 1
  });
  const [formData, setFormData] = useState(initialOpportunity ? {
    title: initialOpportunity.title,
    price: initialOpportunity.price || 0,
    maxParticipants: initialOpportunity.maxParticipants || 1,
    schedule: initialOpportunity.schedule || {
      isExamOnly: false,
      examDate: null,
      courseDates: []
    },
    defaultSettings: {
      useProfileDefaults: true,
      customSettings: {
        price: initialOpportunity.price || 0,
        prepSupportFee: initialOpportunity.prepSupportFee || 0,
        cancellationPolicyHours: 48,
        maxApprentices: initialOpportunity.maxApprentices || 1,
        prepRequirements: initialOpportunity.prepRequirements || []
      }
    },
    notes: initialOpportunity.notes || ''
  } : {
    title: '',
    price: 0,
    maxParticipants: 1,
    schedule: {
      isExamOnly: false,
      examDate: null,
      courseDates: []
    },
    defaultSettings: {
      useProfileDefaults: true,
      customSettings: {
        price: 0,
        prepSupportFee: 0,
        cancellationPolicyHours: 48,
        maxApprentices: 1,
        prepRequirements: []
      }
    }
  });
  const [courseTypes, setCourseTypes] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [organizations, setOrganizations] = useState([]);
  const [organizationInput, setOrganizationInput] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [facilityInput, setFacilityInput] = useState('');
  const [facilitySuggestions, setFacilitySuggestions] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    organization: '',
    address: '',
    city: ''
  });
  const [calendarError, setCalendarError] = useState('');
  const [status, setStatus] = useState('draft');
  const [facilityError, setFacilityError] = useState('');
  const totalSteps = 4;
  const [mentorAgreementSigned, setMentorAgreementSigned] = useState(true);
  const [loadingAgreementStatus, setLoadingAgreementStatus] = useState(true);

  // Fetch mentor settings when component mounts
  useEffect(() => {
    // Load course types with fee ranges
    const loadCourseTypes = async () => {
      try {
        const res = await api.get('/course-types');
        setCourseTypes(res.data);
      } catch (error) {
        console.error('Error loading course types:', error);
      }
    };
    loadCourseTypes();

    const fetchMentorSettings = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          const { prepSupportFee, maxApprentices } = profile;
          setMentorSettings({
            prepSupportFee: prepSupportFee || 0,
            maxApprentices: maxApprentices || 1
          });
          setFormData(prev => ({
            ...prev,
            price: prepSupportFee || 0,
            maxParticipants: maxApprentices || 1,
            defaultSettings: {
              ...prev.defaultSettings,
              customSettings: {
                ...prev.defaultSettings.customSettings,
                prepSupportFee: prepSupportFee || 0,
                maxApprentices: maxApprentices || 1
              }
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching mentor settings:', error);
      }
    };

    if (user) {
      fetchMentorSettings();
    }

    // Fetch user review summary for rating-based features
    const loadRatingSummary = async () => {
      if (user && user._id) {
        try {
          const res = await api.get(`/users/${user._id}/review-summary`);
          setRatingSummary(res.data);
        } catch (err) {
          console.error('Error loading review summary:', err);
        }
      }
    };
    loadRatingSummary();
  }, [user]);

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/opportunities/organizations');
        setOrganizations(response.data.map(org => org._id));
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrganizations();
  }, []);

  // Facility autocomplete effect
  useEffect(() => {
    if (facilityInput.length < 2) {
      setFacilitySuggestions([]);
      return;
    }
    const fetchFacilities = async () => {
      try {
        const res = await api.get(`/facilities?search=${encodeURIComponent(facilityInput)}`);
        setFacilitySuggestions(res.data);
      } catch (err) {
        setFacilitySuggestions([]);
      }
    };
    fetchFacilities();
  }, [facilityInput]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const prepRequirementOptions = ['lesson-plan', 'exam-plan', 'scenarios', 'must-sees template'];

  useEffect(() => {
    if (user) {
      setLoadingAgreementStatus(true);
      getProfile().then(profile => {
        setMentorAgreementSigned(!!profile.mentorAgreementSigned);
        setLoadingAgreementStatus(false);
        if (!profile.mentorAgreementSigned) setStep(0);
      }).catch(() => setLoadingAgreementStatus(false));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'MENTOR') {
      console.error('User must be logged in as a mentor to create an opportunity');
      return;
    }

    // Final calendar validation before submit
    if (formData.schedule.isExamOnly) {
      if (!formData.schedule.examDate) {
        setStep(2);
        setCalendarError('Please select exactly one date for the exam.');
        return;
      }
    } else {
      if (!formData.schedule.courseDates || formData.schedule.courseDates.length < 2) {
        setStep(2);
        setCalendarError('Please select all session dates for this course.');
        return;
      }
    }

    try {
      const payload = {
        title: formData.title,
        notes: formData.notes || '',
        city: user.city,
        price: formData.price,
        facility: selectedFacility ? selectedFacility._id : null,
        schedule: {
          isExamOnly: formData.schedule.isExamOnly,
          examDate: formData.schedule.examDate || null,
          courseDates: Array.isArray(formData.schedule.courseDates) ? formData.schedule.courseDates : [],
        },
        status,
        mentor: user._id,
        prepRequirements: Array.isArray(formData.defaultSettings.customSettings.prepRequirements)
          ? formData.defaultSettings.customSettings.prepRequirements
          : [],
      };
      console.log('Opportunity payload:', payload);
      if (initialOpportunity) {
        await api.patch(`/opportunities/${initialOpportunity._id}`, payload);
      } else {
        await api.post('/opportunities', { ...payload, createdAt: new Date() });
      }
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (dates) => {
    if (formData.schedule.isExamOnly) {
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          examDate: dates instanceof Date && !isNaN(dates) ? dates : null
        }
      }));
    } else {
      // For course dates, ensure we have an array of valid dates
      const validDates = Array.isArray(dates) 
        ? dates.filter(date => date instanceof Date && !isNaN(date))
        : [];
      
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          courseDates: validDates.sort((a, b) => a - b)
        }
      }));
    }
  };

  // Determine if mentor can set maxParticipants > 1 (requires at least 5 reviews and average rating >= 4.5)
  const allowTwoParticipants = user?.role === 'MENTOR'
    && ratingSummary.count >= 5
    && ratingSummary.average >= 4.5;

  useEffect(() => {
    if (step === 2) {
      if (formData.schedule.isExamOnly) {
        if (!formData.schedule.examDate) {
          setCalendarError('Please select the exam date.');
        } else {
          setCalendarError('');
        }
      } else {
        if (!formData.schedule.courseDates || formData.schedule.courseDates.length < 2) {
          setCalendarError('Please select all session dates for this course.');
        } else {
          setCalendarError('');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.schedule.isExamOnly, formData.schedule.examDate, formData.schedule.courseDates, step]);

  useEffect(() => {
    if (initialOpportunity) {
      // Convert dates to JS Date objects
      let examDate = initialOpportunity.schedule?.examDate
        ? new Date(initialOpportunity.schedule.examDate)
        : null;
      let courseDates = Array.isArray(initialOpportunity.schedule?.courseDates)
        ? initialOpportunity.schedule.courseDates.map(d => new Date(d))
        : [];

      // Prefer root-level prepRequirements, fallback to nested if present
      const prepReqs = initialOpportunity.prepRequirements
        || initialOpportunity.defaultSettings?.customSettings?.prepRequirements
        || [];

      setFormData({
        title: initialOpportunity.title,
        price: initialOpportunity.price || 0,
        maxParticipants: initialOpportunity.maxParticipants || 1,
        schedule: {
          ...initialOpportunity.schedule,
          examDate,
          courseDates,
        },
        defaultSettings: {
          useProfileDefaults: true,
          customSettings: {
            price: initialOpportunity.price || 0,
            prepSupportFee: initialOpportunity.prepSupportFee || 0,
            cancellationPolicyHours: 48,
            maxApprentices: initialOpportunity.maxApprentices || 1,
            prepRequirements: prepReqs
          }
        },
        notes: initialOpportunity.notes || ''
      });

      // Set selectedFacility if available
      if (initialOpportunity.facility && typeof initialOpportunity.facility === 'object') {
        setSelectedFacility(initialOpportunity.facility);
        setFacilityInput(initialOpportunity.facility.name);
      } else {
        setSelectedFacility(null);
        setFacilityInput('');
      }

      // Set status from initialOpportunity
      setStatus(initialOpportunity.status || 'draft');
    }
  }, [initialOpportunity]);

  // Add a handler to simulate signing the agreement (replace with real logic as needed)
  const handleSignAgreement = async () => {
    // TODO: Replace with real API call to sign agreement
    await api.post(`/users/${user._id}/sign-mentor-agreement`);
    setMentorAgreementSigned(true);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Opportunity</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      step >= stepNumber ? 'bg-[#d33]' : 'bg-gray-200'
                    }`}
                  />
                  <span className={`mt-2 text-sm ${
                    step >= stepNumber ? 'text-[#d33]' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 ? 'Course Info' :
                     stepNumber === 2 ? 'Schedule' :
                     stepNumber === 3 ? 'Expectations' :
                     'Summary'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Mentor Agreement Required</h3>
                <p className="mb-4 text-gray-700 text-center max-w-xl">
                  Before you can post an opportunity, you must sign the Mentor Agreement. This agreement outlines your responsibilities as a mentor on MentorConnect.
                </p>
                <p className="mb-4 text-gray-600 text-center max-w-xl">
                  After signing, you can download a copy of your signed agreement from the <b>Settings</b> page. You will only need to sign this once.
                </p>
                <button
                  className="bg-[#d33] text-white px-6 py-2 rounded font-medium hover:bg-[#c22] transition-colors"
                  onClick={handleSignAgreement}
                >
                  Review & Sign Mentor Agreement
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Course type
                  </label>
                  <select
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                    required
                  >
                    <option value="">Select a course type</option>
                    {COURSE_OPTIONS.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="facility" className="block text-sm font-medium text-gray-700">
                    Facility
                  </label>
                  <input
                    type="text"
                    id="facility"
                    value={selectedFacility ? selectedFacility.name : facilityInput}
                    onChange={e => {
                      setFacilityInput(e.target.value);
                      setSelectedFacility(null);
                      setShowFacilityForm(false);
                      setFacilityError('');
                    }}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                    placeholder="Start typing to search..."
                    autoComplete="off"
                    disabled={showFacilityForm}
                    required
                    aria-invalid={!!facilityError}
                  />
                  {facilityInput && !selectedFacility && !showFacilityForm && (
                    <div className="bg-white border border-gray-200 rounded shadow mt-1 max-h-40 overflow-y-auto z-50 relative">
                      {facilitySuggestions.map(fac => (
                        <div
                          key={fac._id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedFacility(fac);
                            setFacilityInput(fac.name);
                          }}
                        >
                          <div className="font-medium">{fac.name}</div>
                          <div className="text-xs text-gray-500">{fac.organization} — {fac.address}, {fac.city}</div>
                        </div>
                      ))}
                      <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600 font-medium" onClick={() => {
                        setShowFacilityForm(true);
                        setNewFacility({ name: facilityInput, organization: '', address: '', city: '' });
                      }}>
                        + Add a new facility
                      </div>
                    </div>
                  )}
                  {showFacilityForm && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700">Facility Name</label>
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="Facility Name"
                          value={newFacility.name}
                          onChange={e => setNewFacility(f => ({ ...f, name: e.target.value }))}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700">Organization</label>
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="Organization"
                          value={newFacility.organization}
                          onChange={e => setNewFacility(f => ({ ...f, organization: e.target.value }))}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700">Address</label>
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="Address"
                          value={newFacility.address}
                          onChange={e => setNewFacility(f => ({ ...f, address: e.target.value }))}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-700">City</label>
                        <input
                          className="w-full border rounded px-3 py-2"
                          placeholder="City"
                          value={newFacility.city}
                          onChange={e => setNewFacility(f => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <button
                        className="mt-2 bg-[#d33] text-white px-4 py-2 rounded"
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await api.post('/facilities', newFacility);
                            setSelectedFacility(res.data);
                            setFacilityInput(res.data.name);
                            setShowFacilityForm(false);
                            setNewFacility({ name: '', organization: '', address: '', city: '' });
                          } catch (err) {
                            alert('Error creating facility');
                          }
                        }}
                      >
                        Save Facility
                      </button>
                      <button
                        className="ml-2 text-gray-500 underline"
                        type="button"
                        onClick={() => setShowFacilityForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {facilityError && (
                    <div className="text-red-500 text-sm mt-2">{facilityError}</div>
                  )}
                </div>

                {/* Price field */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Price (optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={e => {
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          setFormData(prev => ({
                            ...prev,
                            price: value
                          }));
                        }
                      }}
                      className="block w-full pl-7 pr-12 rounded-md border border-gray-300 focus:border-[#d33] focus:ring-[#d33] sm:text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      required
                    />
                  </div>
                </div>

                {/* Fee range summary box moved here */}
                {formData.title && (() => {
                  const selected = courseTypes.find(ct => ct.name === formData.title);
                  if (!selected) return null;
                  return (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Based on our data, mentors typically charge <span className="font-medium">${selected.feeRange.min} – ${selected.feeRange.max}</span> for {selected.name} courses.
                      </p>
                      <p className="mt-4 text-xs text-gray-600">
                        We encourage you to set a fee that fairly reflects the time you'll spend preparing your mentee.
                      </p>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Only show maxParticipants if allowed */}
                  {allowTwoParticipants && (
                    <div>
                      <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                        required
                        min="1"
                        max="2"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Profile Default: {mentorSettings.maxApprentices}
                      </p>
                    </div>
                  )}
                  
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Opportunity Type
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isExamOnly"
                          checked={!formData.schedule.isExamOnly}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              isExamOnly: false,
                              examDate: null,
                              courseDates: []
                            }
                          }))}
                          className="h-4 w-4 text-[#d33] focus:ring-[#d33] border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Full Opportunity</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isExamOnly"
                          checked={formData.schedule.isExamOnly}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              isExamOnly: true,
                              examDate: null,
                              courseDates: []
                            }
                          }))}
                          className="h-4 w-4 text-[#d33] focus:ring-[#d33] border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Exam Only</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  {formData.schedule.isExamOnly ? (
                    <DatePicker
                      selected={formData.schedule.examDate}
                      onChange={date => {
                        setFormData(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            examDate: date instanceof Date && !isNaN(date) ? date : null,
                            courseDates: []
                          }
                        }));
                        setCalendarError('');
                      }}
                      inline
                      minDate={new Date()}
                      className="w-full"
                      calendarClassName="mentor-calendar"
                      dayClassName={date =>
                        formData.schedule.examDate && date.getTime() === formData.schedule.examDate.getTime()
                          ? 'mentor-calendar-selected'
                          : 'mentor-calendar-day'
                      }
                    />
                  ) : (
                    <DatePicker
                      selected={null}
                      onChange={date => {
                        if (!date) return;
                        setFormData(prev => {
                          const currentDates = prev.schedule.courseDates;
                          const dateTime = date.getTime();
                          const dateExists = currentDates.some(d => d.getTime() === dateTime);
                          const newDates = dateExists
                            ? currentDates.filter(d => d.getTime() !== dateTime)
                            : [...currentDates, date];
                          return {
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              courseDates: newDates.sort((a, b) => a - b),
                              examDate: null
                            }
                          };
                        });
                        setCalendarError('');
                      }}
                      inline
                      minDate={new Date()}
                      className="w-full"
                      calendarClassName="mentor-calendar"
                      dayClassName={date => {
                        const isSelected = formData.schedule.courseDates.some(
                          d => d.getTime() === date.getTime()
                        );
                        return isSelected ? 'mentor-calendar-selected' : 'mentor-calendar-day';
                      }}
                    />
                  )}
                  {calendarError && (
                    <div className="text-red-500 text-sm mt-2 text-center">{calendarError}</div>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-0">
                    Prep Requirements
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Select all options you would like your apprentice to prepare.</p>
                  <div className="flex flex-wrap gap-2">
                    {prepRequirementOptions.map(req => (
                      <button
                        key={req}
                        type="button"
                        onClick={() => {
                          const reqs = formData.defaultSettings.customSettings.prepRequirements;
                          setFormData(prev => ({
                            ...prev,
                            defaultSettings: {
                              ...prev.defaultSettings,
                              customSettings: {
                                ...prev.defaultSettings.customSettings,
                                prepRequirements: reqs.includes(req)
                                  ? reqs.filter(r => r !== req)
                                  : [...reqs, req]
                              }
                            }
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          formData.defaultSettings.customSettings.prepRequirements.includes(req)
                            ? 'bg-[#d33] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {req}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Additional notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                    placeholder="Add any notes about this opportunity"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
                <div className="bg-gray-50 border border-gray-200 rounded p-4 text-sm text-gray-700">
                  <div className="mb-2"><span className="font-medium">Course type:</span> {formData.title}</div>
                  <div className="mb-2"><span className="font-medium">Facility:</span> {selectedFacility ? selectedFacility.name : ''}</div>
                  <div className="mb-2"><span className="font-medium">Price:</span> {formData.price ? `$${formData.price}` : 'N/A'}</div>
                  <div className="mb-2"><span className="font-medium">Dates:</span> {formData.schedule.isExamOnly
                    ? (formData.schedule.examDate ? formData.schedule.examDate.toLocaleDateString() : 'N/A')
                    : (formData.schedule.courseDates && formData.schedule.courseDates.length > 0
                        ? formData.schedule.courseDates.map(d => d.toLocaleDateString()).join(', ')
                        : 'N/A')}
                  </div>
                  <div className="mb-2"><span className="font-medium">Opportunity type:</span> {formData.schedule.isExamOnly ? 'Exam Only' : 'Full Opportunity'}</div>
                  <div className="mb-2"><span className="font-medium">Prep Requirements:</span> {formData.defaultSettings.customSettings.prepRequirements.length > 0
                    ? formData.defaultSettings.customSettings.prepRequirements.join(', ')
                    : 'None'}</div>
                  <div className="mb-2"><span className="font-medium">Notes:</span> {formData.notes || 'None'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opportunity Status</label>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="h-4 w-4 text-[#d33] focus:ring-[#d33] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Draft</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="h-4 w-4 text-[#d33] focus:ring-[#d33] border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Published</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]"
                >
                  Previous
                </button>
              )}
              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    if (step === 1) {
                      if (!selectedFacility) {
                        setFacilityError('Please select a facility for this course.');
                        return;
                      }
                    }
                    if (step === 2) {
                      // Calendar validation
                      if (formData.schedule.isExamOnly) {
                        if (!formData.schedule.examDate) {
                          setCalendarError('Please select the exam date.');
                          return;
                        }
                      } else {
                        if (!formData.schedule.courseDates || formData.schedule.courseDates.length < 2) {
                          setCalendarError('Please select all session dates for this course.');
                          return;
                        }
                      }
                      setCalendarError('');
                    }
                    setStep(step + 1);
                  }}
                  disabled={step === 1 && !formData.title}
                  className={`ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    step === 1 && !formData.title
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#d33] hover:bg-[#c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className={`ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                    !selectedFacility
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#d33] hover:bg-[#c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]'
                  }`}
                >
                  Create Opportunity
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

CreateCourseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialOpportunity: PropTypes.object
};

export default CreateCourseModal; 