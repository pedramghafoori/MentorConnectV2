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
import OurThreeProngedApproach from '../../components/threeProngApproach.jsx';

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

const HomePage = () => {
  const [streams, setStreams] = useState([]);
  const [city, setCity] = useState("Toronto");
  const [locating, setLocating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [mentorUsers, setMentorUsers] = useState([]);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1000);

  const toggleStream = (option) => {
    setStreams(prev =>
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLocating(false);
        },
        () => setLocating(false)
      );
    } else {
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
    if (selectedCertifications.length === 0) return;
    // Take the first certification since the Dashboard component expects a single certification
    const certification = selectedCertifications[0];
    navigate(`/dashboard?certification=${encodeURIComponent(certification)}&city=${encodeURIComponent(city)}`);
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
                        onClick={() => setSelectedCertifications(selectedCertifications.includes(cert.value)
                          ? selectedCertifications.filter(c => c !== cert.value)
                          : [...selectedCertifications, cert.value])}
                      >
                        {cert.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Separator */}
                <div className="cert-separator" />
                {/* Instructor Trainers Section */}
                <div className="form-section cert-section it-section">
                  <label className="form-label mb-2">Instructor Trainers</label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {IT_CERTS.map(cert => (
                      <button
                        key={cert.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-sm ${selectedCertifications.includes(cert.value) ? 'bg-[#d33] text-white border-[#d33]' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                        onClick={() => setSelectedCertifications(selectedCertifications.includes(cert.value)
                          ? selectedCertifications.filter(c => c !== cert.value)
                          : [...selectedCertifications, cert.value])}
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
                    <select
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="location-select"
                    >
                      <option>Toronto</option>
                      <option>Ottawa</option>
                      <option>Vancouver</option>
                      <option>Calgary</option>
                    </select>
                  </div>
                </div>
                {/* Search Button */}
                <button
                  type="submit"
                  className="search-button mt-4"
                >
                  Search
                </button>
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
      <Modal isOpen={showLoginModal} onClose={handleCloseModals}>
        <LoginForm onClose={handleCloseModals} onSwitchToRegister={handleOpenRegister} />
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={handleCloseModals}>
        <RegisterForm onClose={handleCloseModals} onSwitchToLogin={handleOpenLogin} />
      </Modal>
    </div>
  );
};

export default HomePage; 