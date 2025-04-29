import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
import "../../css/HomePage.css";
import mentorHero from "../../assets/mentor-hero.png";

const HomePage = () => {
  const [streams, setStreams] = useState([]);
  const [city, setCity] = useState("Toronto");
  const [locating, setLocating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    // Add your search logic here
  };

  return (
    <div className="home-container">
      <div className="content-wrapper">
        {/* Search Card */}
        <div className="search-card">
          <div className="search-card-inner">
            <h1 className="search-title">
              Find Mentors Near You
            </h1>
            <p className="search-description">
              Whether you're seeking guidance on a subject, career advice, or skill development—find your mentor here.
            </p>

            <form onSubmit={handleSearch} className="search-form">
              {/* Streams Section */}
              <div className="form-section">
                <label className="form-label">Streams</label>
                <div className="streams-grid">
                  {["Bronze", "First Aid", "NL", "Instructor Trainer"].map(option => (
                    <label key={option} className="stream-option">
                      <input
                        type="checkbox"
                        value={option}
                        checked={streams.includes(option)}
                        onChange={() => toggleStream(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Section */}
              <div className="form-section">
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
                className="search-button"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image-container">
          <img
            src={mentorHero}
            alt="Mentor guiding student beside pool"
            className="hero-image"
          />
        </div>
      </div>

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