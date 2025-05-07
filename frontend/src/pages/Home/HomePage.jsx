import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
import "../../css/HomePage.css";
import mentorHero from "../../assets/mentor-hero1.png";
import FeaturedUsersCarousel from './FeaturedUsersCarousel';
import CanadaMentorMap from "../../../components/CanadaMentorMap.jsx";
import { cityCoordinates } from '../../../components/cityCoordinates';
import Container from '../../components/Container';
import OurThreeProngedApproach from '../../components/ThreeProngApproach';
import cities from '../../lib/cities.json';

// Define new certification sections and mapping
const EXAMINER_CERTS = [
  { label: 'First Aid', value: 'EXAMINER_FIRST_AID' },
  { label: 'Bronze', value: 'EXAMINER_BRONZE' },
  { label: 'National Lifeguard', value: 'EXAMINER_NL' },
];
const IT_CERTS = [
  { label: 'First Aid', value: 'INSTRUCTOR_TRAINER_FIRST_AID' },
  { label: 'Lifesaving', value: 'INSTRUCTOR_TRAINER_LIFESAVING' },
  { label: 'National Lifeguard', value: 'INSTRUCTOR_TRAINER_NL' },
];

const CityAutocomplete = ({ value, onChange, onSelect, inputError }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length > 0) {
      const filteredCities = cities.filter(city =>
        city.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filteredCities);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    onChange(city.label);
    onSelect(city.value);
    setShowSuggestions(false);
  };

  return (
    <div className="relative flex-1" ref={inputRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Enter city name"
        className="location-select"
        style={{
          padding: '0.625rem 1rem',
          border: inputError ? '2px solid #d33' : '1px solid rgb(229, 231, 235)',
          borderRadius: '9999px',
          fontSize: '0.875rem',
          color: 'rgb(75, 85, 99)',
          outline: 'none',
          transition: 'border-color 0.15s',
          width: '100%'
        }}
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((city, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(city)}
            >
              {city.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const HomePage = () => {
  const [streams, setStreams] = useState([]);
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locating, setLocating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [mentorUsers, setMentorUsers] = useState([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);
  const [showCertError, setShowCertError] = useState(false);
  const [showLocationError, setShowLocationError] = useState(false);

  const toggleStream = (option) => {
    setStreams(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get city name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            
            // Extract city and province from the address
            const address = data.address;
            const cityName = address.city || address.town || address.village || address.suburb;
            const province = address.state;
            
            if (cityName && province) {
              // Format the city name to match our cities.json format
              const formattedCity = `${cityName}, ${province}`;
              setCity(formattedCity);
              setSelectedCity(formattedCity);
            }
          } catch (error) {
            console.error('Error getting location:', error);
          } finally {
            setLocating(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocating(false);
    }
  };

  const handleOpenLogin = () => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    let hasError = false;
    if (selectedCertifications.length === 0) {
      setShowCertError(true);
      hasError = true;
    } else {
      setShowCertError(false);
    }
    if (!city && !selectedCity) {
      setShowLocationError(true);
      hasError = true;
    } else {
      setShowLocationError(false);
    }
    if (hasError) return;
    console.log('Search triggered', { selectedCertifications, city, selectedCity }); // Debug log
    
    // Take the first certification since the Dashboard component expects a single certification
    const certification = selectedCertifications[0];
    // Extract just the city name (before the comma)
    const cityName = selectedCity ? selectedCity.split(',')[0].trim() : city;
    
    console.log('Navigating to dashboard with:', { certification, cityName }); // Debug log
    navigate(`/dashboard?certification=${encodeURIComponent(certification)}&city=${encodeURIComponent(cityName)}`);
  };

  // Hide error when user selects a certification
  const handleCertClick = (certValue) => {
    setShowCertError(false);
    setSelectedCertifications(selectedCertifications.includes(certValue)
      ? selectedCertifications.filter(c => c !== certValue)
      : [...selectedCertifications, certValue]);
  };

  // Hide location error when user types or selects a city
  const handleCityChange = (val) => {
    setShowLocationError(false);
    setCity(val);
  };
  const handleCitySelect = (val) => {
    setShowLocationError(false);
    setSelectedCity(val);
  };

  useEffect(() => {
    // Fetch all users with city, province, and avatarUrl
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMentorUsers(data.filter(u => u.city && u.province && u.avatarUrl));
        } else {
          setMentorUsers([]);
          console.error('API did not return an array:', data);
        }
      });
  }, []);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const usersWithCoords = mentorUsers
    .map(user => {
      const key = `${user.city},${user.province}`;
      const coords = cityCoordinates[key];
      if (!coords) return null;
      return {
        ...user,
        latitude: coords.lat,
        longitude: coords.lng,
      };
    })
    .filter(Boolean);

  return (
    <div className="home-container">
      <Container>
        <div className="content-wrapper">
          {/* Hero Image (Order 0) */}
          <div className="hero-image-container">
            <img
              src={mentorHero}
              alt="Mentor guiding student beside pool"
              className="hero-image"
            />
          </div>

          {/* Search Card (Order 1) */}
          <div className="search-card">
            <div className="search-card-inner">
              <h1 className="search-title">
                Find Mentors Near You
              </h1>
              <p className="search-description">
                Whether you're seeking guidance on a subject, career advice, or skill development—find your mentor here.
              </p>

              <form onSubmit={handleSearch} className="search-form">
                {/* Examiners Section */}
                <div className="form-section cert-section examiner-section">
                  <label className="form-label mb-2">Examiner Mentors</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {EXAMINER_CERTS.map(cert => (
                      <button
                        key={cert.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm ${selectedCertifications.includes(cert.value) ? 'bg-[#d33] text-white border-[#d33]' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                        onClick={() => handleCertClick(cert.value)}
                      >
                        {cert.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Separator */}
                <div className="cert-separator" />
                {/* IT Section */}
                <div className="form-section cert-section it-section">
                  <label className="form-label mb-2">Instructor Trainer Mentors</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {IT_CERTS.map(cert => (
                      <button
                        key={cert.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm ${selectedCertifications.includes(cert.value) ? 'bg-[#d33] text-white border-[#d33]' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                        onClick={() => handleCertClick(cert.value)}
                      >
                        {cert.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Location Section */}
                <div className="form-section location-section">
                  <label className="form-label">Location</label>
                  <div className="location-row">
                    <button
                      type="button"
                      onClick={handleLocate}
                      disabled={locating}
                      className="locate-button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="locate-icon" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <CityAutocomplete
                      value={city}
                      onChange={handleCityChange}
                      onSelect={handleCitySelect}
                      inputError={showLocationError}
                    />
                  </div>
                </div>
                {/* Search Button */}
                <button
                  type="submit"
                  className="search-button mt-4"
                  onClick={handleSearch}
                >
                  Search
                </button>
                {showCertError && (
                  <div style={{ color: '#d33', marginTop: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                    Please select at least one certification.
                  </div>
                )}
                {showLocationError && (
                  <div style={{ color: '#d33', marginTop: '0.75rem', fontWeight: 500, textAlign: 'center' }}>
                    Please enter a location.
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Three Pronged Approach (Order 2) */}
          <div className="three-pronged-approach" style={{ order: 2 }}>
            <OurThreeProngedApproach />
          </div>

          {/* Featured Carousel (Order 3) */}
          <FeaturedUsersCarousel />
        </div>
        {/* Mentor Map Section - always last */}
        {isDesktop && <CanadaMentorMap users={usersWithCoords} />}
      </Container>

      {/* Auth Modals */}
      {showLoginModal && (
        <Modal onClose={handleCloseModals}>
          <LoginForm onClose={handleCloseModals} onSwitchToRegister={handleOpenRegister} />
        </Modal>
      )}
      {showRegisterModal && (
        <Modal onClose={handleCloseModals}>
          <RegisterForm onClose={handleCloseModals} onSwitchToLogin={handleOpenLogin} />
        </Modal>
      )}
    </div>
  );
};

export default HomePage; 