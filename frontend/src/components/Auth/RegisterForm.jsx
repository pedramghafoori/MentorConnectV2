import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import CANADIAN_CITIES from '../../lib/cities.json';
import LANGUAGES from '../../lib/languages.json';
import axios from 'axios';
import './RegisterForm.css';
import ProfilePictureEditor from '../../components/ProfilePictureEditor';
import AvatarFallback from '../../components/AvatarFallback';

const RegisterForm = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Form step state
  const [currentStep, setCurrentStep] = useState(1);
  const [animationDirection, setAnimationDirection] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Add animation restart state
  const [typingReset, setTypingReset] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  
  // Form field states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [lssId, setLssId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cityInput, setCityInput] = useState('Toronto, ON');
  const [location, setLocation] = useState({ value: 'Toronto, ON', label: 'Toronto, ON' });
  const [languages, setLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState('');
  const [workplaces, setWorkplaces] = useState([]);
  const [newWorkplace, setNewWorkplace] = useState('');
  const [heardAbout, setHeardAbout] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Form validation states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add state for LSS ID validation and loading
  const [isLssIdValid, setIsLssIdValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [certificationsFetched, setCertificationsFetched] = useState(false);

  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const cityInputRef = useRef(null);

  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);
  const languageInputRef = useRef(null);

  const [certifications, setCertifications] = useState([]);

  // Add state for profile picture
  const [profileImage, setProfileImage] = useState(null); // File or null
  const [avatarCrop, setAvatarCrop] = useState(null); // { offset, scale, rotate } or null
  const [showPictureEditor, setShowPictureEditor] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');

  const isStrongPassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);

  const toggleHeardAbout = (option) => {
    setHeardAbout(prev =>
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleAddWorkplace = () => {
    if (!newWorkplace.trim()) return;
    setWorkplaces([...workplaces, newWorkplace.trim()]);
    setNewWorkplace('');
  };

  const handleRemoveWorkplace = (index) => {
    const updatedWorkplaces = [...workplaces];
    updatedWorkplaces.splice(index, 1);
    setWorkplaces(updatedWorkplaces);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (type === 'workplace') {
        handleAddWorkplace();
      }
    }
  };

  // Add handler for typing animation reset
  useEffect(() => {
    setTypingReset(true);
    setTypingComplete(false);
    
    const resetTimer = setTimeout(() => {
      setTypingReset(false);
    }, 50);
    
    // Add timer to set typing as complete after animation finishes
    const completeTimer = setTimeout(() => {
      setTypingComplete(true);
    }, 4000); // Match this with your animation duration
    
    return () => {
      clearTimeout(resetTimer);
      clearTimeout(completeTimer);
    };
  }, [currentStep]);

  const goToNextStep = async () => {
    if (currentStep === 1 && (!firstName.trim() || !lastName.trim())) {
      setError('Please enter your first and last name');
      return;
    }
    
    if (currentStep === 2) {
      // Validate LSS ID when on step 2
      if (!lssId.trim()) {
        setError('Please enter your LSS ID');
        return;
      }
      
      // Check if LSS ID is 6 characters
      if (lssId.trim().length !== 6) {
        setError('LSS ID must be 6 characters long');
        setIsLssIdValid(false);
        return;
      }
      
      setIsLssIdValid(true);
      
      try {
        if (!certificationsFetched) {
          setIsLoading(true);
          setError('');
          // Fetch certifications using the correct API endpoint
          const response = await axios.post('/api/lss/certifications', { lssId });
          if (response.data && response.data.certifications) {
            // Transform to array of { type, years }
            const certArray = Object.entries(response.data.certifications)
              .filter(([_, cert]) => cert.hasCredential)
              .map(([category, cert]) => ({
                type: category,
                years: cert.yearsOfExperience
              }));
            setCertifications(certArray);
          }
          setCertificationsFetched(true);
        }
      } catch (err) {
        console.error('Failed to fetch certifications:', err);
        // Don't block progression if fetch fails
        setCertifications([]);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (currentStep === 4) {
      setError('');
      setAnimationDirection('slide-left');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
      return;
    }
    
    setError('');
    setAnimationDirection('slide-left');
    setIsAnimating(true);
    
    // Wait for animation to complete before changing step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevStep = () => {
    setError('');
    setAnimationDirection('slide-right');
    setIsAnimating(true);
    
    // Wait for animation to complete before changing step
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Add debug logging
    console.log('Password validation:', {
      password,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasMinLength: password.length >= 8,
      isValid: isStrongPassword(password)
    });
    
    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, and a number.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    try {
      let avatarUrl = '';
      if (profileImage) {
        // Upload image to backend (assume /users/avatar endpoint returns URL)
        const formData = new FormData();
        formData.append('avatar', profileImage);
        const uploadRes = await axios.post('/users/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = uploadRes.data.url;
      }
      const res = await register({
        lssId,
        firstName,
        lastName,
        email,
        password,
        phone,
        heardAbout: heardAbout.join(','),
        city: location.value.split(',')[0].trim(),
        province: location.value.split(',')[1]?.trim() || '',
        languages: languages.map(lang => lang.value),
        workplaces,
        certifications,
        termsAccepted,
        avatar: avatarUrl,
        avatarCrop: avatarCrop || null,
      });
      
      setSuccess(res.message || 'Registration successful!');
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Unable to register');
    }
  };

  // Modify LSS ID input to handle uppercase transformation
  const handleLssIdChange = (e) => {
    const value = e.target.value.toUpperCase();
    setLssId(value);
    
    // Reset validation when typing
    if (!isLssIdValid) {
      setIsLssIdValid(true);
    }
  };

  // Get class names for step animation
  const getStepClasses = (step) => {
    if (step !== currentStep) return 'register-step hidden';
    
    let classes = 'register-step active';
    
    if (isAnimating) {
      if (animationDirection === 'slide-left') {
        classes = 'register-step slide-left';
      } else if (animationDirection === 'slide-right') {
        classes = 'register-step slide-right';
      }
    }
    
    return classes;
  };

  // Handle city input change and filtering
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCityInput(value);
    
    if (value.trim() === '') {
      setFilteredCities([]);
      return;
    }
    
    const filtered = CANADIAN_CITIES.filter(city => 
      city.label.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
    
    setFilteredCities(filtered);
    setShowCitySuggestions(true);
  };
  
  // Handle city selection from suggestions
  const handleCitySelect = (city) => {
    setCityInput(city.label);
    setLocation(city);
    setShowCitySuggestions(false);
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCitySuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle language input change and filtering
  const handleLanguageInputChange = (e) => {
    const value = e.target.value;
    setLanguageInput(value);
    
    if (value.trim() === '') {
      setFilteredLanguages([]);
      return;
    }
    
    const filtered = LANGUAGES.filter(lang => 
      lang.label.toLowerCase().includes(value.toLowerCase()) && 
      !languages.some(l => l.value === lang.value)
    ).slice(0, 5); // Limit to 5 suggestions
    
    setFilteredLanguages(filtered);
    setShowLanguageSuggestions(true);
  };
  
  // Handle language selection from suggestions
  const handleLanguageSelect = (language) => {
    setLanguages([...languages, language]);
    setLanguageInput('');
    setShowLanguageSuggestions(false);
  };
  
  // Handle language removal
  const handleRemoveLanguage = (languageToRemove) => {
    setLanguages(languages.filter(lang => lang.value !== languageToRemove.value));
  };
  
  // Handle Enter key press in language input
  const handleLanguageKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's a match in the filtered results, add the first one
      if (filteredLanguages.length > 0) {
        handleLanguageSelect(filteredLanguages[0]);
      }
    }
  };
  
  // Close language suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageInputRef.current && !languageInputRef.current.contains(event.target)) {
        setShowLanguageSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to get preview (cropped or fallback)
  const getAvatarPreview = () => {
    if (profileImage && avatarPreviewUrl) {
      // Use avatarCrop state which should hold relative offset
      const defaultCrop = { offset: { x: 0, y: 0 }, scale: 1, rotate: 0 };
      const savedCrop = avatarCrop || defaultCrop;
      const relativeOffset = savedCrop.offset || defaultCrop.offset;
      const scale = savedCrop.scale || defaultCrop.scale;
      const rotate = savedCrop.rotate || defaultCrop.rotate;

      const size = 80; // Size of the avatar in RegisterForm

      // Convert relative offset to pixels for this size
      const pixelOffset = {
        x: relativeOffset.x * size,
        y: relativeOffset.y * size,
      };

      return (
        <div className="register-avatar-preview" style={{ 
          width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: '#f0f0f0'
        }}>
          <img
            src={avatarPreviewUrl}
            alt="Profile preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: '50%',
              left: '50%',
              // Use calculated pixel offset
              transform: `translate(-50%, -50%) translate(${pixelOffset.x}px, ${pixelOffset.y}px) scale(${scale}) rotate(${rotate}deg)`
            }}
          />
        </div>
      );
    }
    // Fallback avatar
    return (
      <div className="register-avatar-preview" style={{ 
        width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: 'transparent'
      }}>
        <AvatarFallback
          firstName={firstName}
          size={80}
        />
      </div>
    );
  };

  // Handle image/crop from editor
  const handlePictureSave = (file, relativeCrop, previewUrl) => {
    setProfileImage(file);
    setAvatarCrop(relativeCrop); // Store the relative crop
    setAvatarPreviewUrl(previewUrl);
    setShowPictureEditor(false);
  };
  const handlePictureDelete = () => {
    setProfileImage(null);
    setAvatarCrop(null);
    setAvatarPreviewUrl('');
    setShowPictureEditor(false);
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Create account</h2>
      
      {/* Progress bar moved here */}
      <div className="register-progress-container">
        <div className="register-progress-bar">
          <div 
            className="register-progress-fill" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="relative">
          {/* Step 1: Basic Information */}
          <div className={getStepClasses(1)}>
            <h3 className="register-step-title">We're excited to have you here!</h3>
            
            <div className="register-input-group">
              <label htmlFor="firstName" className="register-label">First Name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="register-input"
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="lastName" className="register-label">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="register-input"
                required
              />
            </div>

            <button 
              type="button" 
              onClick={goToNextStep}
              className="register-button-primary"
            >
              Next
            </button>
          </div>
          
          {/* Step 2: Contact Information */}
          <div className={getStepClasses(2)}>
            <h3 className="register-step-title">More information</h3>
            
            <div className="register-input-group">
              <label htmlFor="lssId" className="register-label">LSS ID</label>
              <input
                id="lssId"
                type="text"
                value={lssId}
                onChange={handleLssIdChange}
                className={`register-input ${!isLssIdValid ? 'register-input-invalid' : ''}`}
                maxLength={6}
                required
              />
              <p className="register-helper-text">
                We will use this to verify your profile and fetch your certifications for you.
              </p>
              {!isLssIdValid && (
                <p className="register-error-text">
                  LSS ID must be exactly 6 characters long.
                </p>
              )}
            </div>

            <div className="register-input-group">
              <label htmlFor="email" className="register-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="register-input"
                required
              />
            </div>

            <div className="register-input-group">
              <label htmlFor="phone" className="register-label">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="register-input"
                required
              />
            </div>

            <div className="register-button-group">
              <button 
                type="button" 
                onClick={goToPrevStep}
                className="register-button-secondary"
                disabled={isLoading}
              >
                Back
              </button>
              
              <button 
                type="button" 
                onClick={goToNextStep}
                className="register-button-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Fetching...' : 'Next'}
              </button>
            </div>
          </div>
          
          {/* Step 3: Additional Information */}
          <div className={getStepClasses(3)}>
            <h3 className="register-step-title">Tell us a little bit more about yourself</h3>
            <p className="register-subtitle">You can always edit this information later in settings</p>
            
            <div className="register-input-group">
              <label htmlFor="location" className="register-label">What city are you based out of?</label>
              <div className="register-city-autocomplete" ref={cityInputRef}>
                <input
                  id="location"
                  type="text"
                  value={cityInput}
                  onChange={handleCityInputChange}
                  className="register-input"
                  placeholder="Type to search cities..."
                />
                {showCitySuggestions && filteredCities.length > 0 && (
                  <ul className="register-city-suggestions">
                    {filteredCities.map((city) => (
                      <li 
                        key={city.value} 
                        onClick={() => handleCitySelect(city)}
                        className="register-city-suggestion-item"
                      >
                        {city.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="register-input-group">
              <label className="register-label">What languages do you speak?</label>
              <div className="register-language-tags">
                {languages.map((lang) => (
                  <div key={lang.value} className="register-tag">
                    <span className="register-tag-text">{lang.label}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveLanguage(lang)}
                      className="register-tag-remove"
                      aria-label="Remove language"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="register-language-autocomplete" ref={languageInputRef}>
                <input
                  type="text"
                  value={languageInput}
                  onChange={handleLanguageInputChange}
                  onKeyDown={handleLanguageKeyDown}
                  className="register-input"
                  placeholder="Type to add languages..."
                />
                {showLanguageSuggestions && filteredLanguages.length > 0 && (
                  <ul className="register-language-suggestions">
                    {filteredLanguages.map((language) => (
                      <li 
                        key={language.value} 
                        onClick={() => handleLanguageSelect(language)}
                        className="register-language-suggestion-item"
                      >
                        {language.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="register-input-group">
              <label className="register-label">What organizations have you taught with?</label>
              <div className="register-tag-container">
                {workplaces.map((workplace, index) => (
                  <div key={index} className="register-tag">
                    <span className="register-tag-text">{workplace}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveWorkplace(index)}
                      className="register-tag-remove"
                      aria-label="Remove workplace"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="register-tag-input-container">
                <input
                  type="text"
                  value={newWorkplace}
                  onChange={(e) => setNewWorkplace(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'workplace')}
                  placeholder="Add workplace and press Enter"
                  className="register-tag-input"
                />
                <button
                  type="button"
                  onClick={handleAddWorkplace}
                  disabled={!newWorkplace.trim()}
                  className="register-tag-button"
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="register-input-group">
              <label className="register-label">How did you hear about MentorConnect?</label>
              <div className="register-checkbox-grid">
                {['Word of mouth', 'My area chair', 'Lifesaving Society', 'My instructor']
                  .map(option => (
                    <label key={option} className="register-checkbox-label">
                      <input
                        type="checkbox"
                        value={option}
                        checked={heardAbout.includes(option)}
                        onChange={() => toggleHeardAbout(option)}
                        className="register-checkbox-input"
                      />
                      <span className="register-checkbox-text">
                        {option}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
            
            <div className="register-button-group">
              <button 
                type="button" 
                onClick={goToPrevStep}
                className="register-button-secondary"
              >
                Back
              </button>
              
              <button 
                type="button" 
                onClick={goToNextStep}
                className="register-button-primary"
              >
                Next
              </button>
            </div>
          </div>
          
          {/* Step 4: Password and Terms */}
          <div className={getStepClasses(4)}>
            <h3 className="register-step-title">Let's set a password for your account</h3>
            
            <div className="register-input-group">
              <label htmlFor="password" className="register-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="register-input"
              />
              <p className="register-helper-text">
                Password must be at least 8 characters and include uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="register-input-group">
              <label htmlFor="confirmPassword" className="register-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="register-input"
              />
            </div>

            <div className="register-input-group">
              <label className="register-terms-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="register-terms-checkbox"
                  required
                />
                <span className="register-terms-text">
                  I agree to the{' '}
                  <Link to="/terms" className="register-link" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/mentor-agreement" className="register-link" target="_blank" rel="noopener noreferrer">
                    User Agreement
                  </Link>
                </span>
              </label>
            </div>

            {error && <p className="register-error-message">{error}</p>}
            {success && <p className="register-success-text">{success}</p>}
            
            <div className="register-button-group">
              <button 
                type="button" 
                onClick={goToPrevStep}
                className="register-button-secondary"
              >
                Back
              </button>
              
              <button 
                type="submit"
                className="register-button-primary"
                disabled={!termsAccepted}
              >
                Register
              </button>
            </div>
          </div>
        </div>

        <p className="register-login-text">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="register-login-link"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm; 