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

const CreateCourseModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [mentorSettings, setMentorSettings] = useState({
    prepSupportFee: 0,
    maxApprentices: 1
  });
  const [formData, setFormData] = useState({
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

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const prepRequirementOptions = ['lesson-plan', 'exam-plan', 'scenarios', 'must-sees'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || user.role !== 'MENTOR') {
      console.error('User must be logged in as a mentor to create an opportunity');
      return;
    }

    try {
      const response = await api.post('/opportunities', {
        title: formData.title,
        notes: formData.notes || '',
        city: user.city,
        price: formData.price,
        createdAt: new Date(),
        mentor: user._id
      });

      onClose();
    } catch (error) {
      console.error('Error creating opportunity:', error);
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
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-colors ${
                      step >= stepNumber ? 'bg-[#d33]' : 'bg-gray-200'
                    }`}
                  />
                  <span className={`mt-2 text-sm ${
                    step >= stepNumber ? 'text-[#d33]' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 ? 'Basic Info' : 
                     stepNumber === 2 ? 'Schedule' : 'Settings'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Opportunity
                  </label>
                  <select
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                    required
                  >
                    <option value="">Select a opportunity</option>
                    {COURSE_OPTIONS.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                    placeholder="Add any notes about this opportunity (optional)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price
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
                        onChange={(e) => {
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
                  {!allowTwoParticipants && (
                    <p className="mt-1 text-xs text-red-500">
                      To set more than 1 participant, you need at least 5 reviews and a minimum rating of 4.5+.
                    </p>
                  )}
                </div>

                {/* Fee range summary box */}
                {formData.title && (() => {
                  const selected = courseTypes.find(ct => ct.name === formData.title);
                  if (!selected) return null;
                  return (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-gray-700">
                        Based on our data, Mentors typically charge ${selected.feeRange.min} – ${selected.feeRange.max} for this opportunity.
                      </p>
                      <p className="mt-2 text-gray-600">
                        We encourage you to set a fee that fairly reflects the time you'll spend preparing your mentee.
                      </p>
                    </div>
                  );
                })()}

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
                  <DatePicker
                    selected={null}
                    onChange={(date) => {
                      if (!date) return;
                      
                      setFormData(prev => {
                        const currentDates = prev.schedule.courseDates;
                        const dateTime = date.getTime();
                        
                        // Check if the date is already selected
                        const dateExists = currentDates.some(d => d.getTime() === dateTime);
                        
                        // If date exists, remove it; if not, add it
                        const newDates = dateExists
                          ? currentDates.filter(d => d.getTime() !== dateTime)
                          : [...currentDates, date];
                        
                        return {
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            courseDates: newDates.sort((a, b) => a - b)
                          }
                        };
                      });
                    }}
                    inline
                    monthsShown={1}
                    minDate={new Date()}
                    className="w-full"
                    calendarClassName="mentor-calendar"
                    dayClassName={(date) => {
                      const isSelected = formData.schedule.courseDates.some(
                        d => d.getTime() === date.getTime()
                      );
                      return isSelected ? 'mentor-calendar-selected' : 'mentor-calendar-day';
                    }}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.defaultSettings.useProfileDefaults}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        defaultSettings: {
                          ...prev.defaultSettings,
                          useProfileDefaults: e.target.checked
                        }
                      }))}
                      className="h-4 w-4 text-[#d33] focus:ring-[#d33] border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Use profile default settings
                    </span>
                  </label>
                </div>

                {!formData.defaultSettings.useProfileDefaults && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="customLocation" className="block text-sm font-medium text-gray-700">
                          Custom Location
                        </label>
                        <input
                          type="text"
                          id="customLocation"
                          name="defaultSettings.customSettings.location"
                          value={formData.defaultSettings.customSettings.location}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="prepSupportFee" className="block text-sm font-medium text-gray-700">
                          Prep Support Fee
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            id="prepSupportFee"
                            name="defaultSettings.customSettings.prepSupportFee"
                            value={formData.defaultSettings.customSettings.prepSupportFee}
                            onChange={handleInputChange}
                            className="block w-full pl-7 pr-12 rounded-md border border-gray-300 focus:border-[#d33] focus:ring-[#d33] sm:text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cancellationPolicyHours" className="block text-sm font-medium text-gray-700">
                          Cancellation Policy (hours)
                        </label>
                        <input
                          type="number"
                          id="cancellationPolicyHours"
                          name="defaultSettings.customSettings.cancellationPolicyHours"
                          value={formData.defaultSettings.customSettings.cancellationPolicyHours}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                          min="1"
                          max="168"
                        />
                      </div>

                      <div>
                        <label htmlFor="maxApprentices" className="block text-sm font-medium text-gray-700">
                          Max Apprentices
                        </label>
                        <input
                          type="number"
                          id="maxApprentices"
                          name="defaultSettings.customSettings.maxApprentices"
                          value={formData.defaultSettings.customSettings.maxApprentices}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#d33] focus:outline-none focus:ring-[#d33] sm:text-sm"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prep Requirements
                      </label>
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
                  </div>
                )}
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
              {step < 3 ? (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); setStep(step + 1); }}
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
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#d33] hover:bg-[#c22] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]"
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
  onClose: PropTypes.func.isRequired
};

export default CreateCourseModal; 