import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Modal from '../../components/Modal';
import LoginForm from '../../components/Auth/LoginForm';
import RegisterForm from '../../components/Auth/RegisterForm';
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
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-[1400px] mx-auto px-4 py-12 relative">
        {/* Search Card */}
        <div className="absolute z-10 left-4 top-16 md:left-12 max-w-[400px]">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl">
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2">
              Find Mentors Near You
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Whether you're seeking guidance on a subject, career advice, or skill development—find your mentor here.
            </p>

            <form onSubmit={handleSearch} className="space-y-5">
              {/* Streams Section */}
              <div>
                <label className="text-gray-900 font-medium block mb-2">Streams</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Bronze", "First Aid", "NL", "Instructor Trainer"].map(option => (
                    <label key={option} className="relative">
                      <input
                        type="checkbox"
                        value={option}
                        checked={streams.includes(option)}
                        onChange={() => toggleStream(option)}
                        className="peer sr-only"
                      />
                      <span className="block w-full py-2.5 text-center text-sm text-gray-600 bg-white border border-gray-200 rounded-full cursor-pointer transition-all hover:border-gray-300 peer-checked:border-[#e63946] peer-checked:bg-[#fef2f2] peer-checked:text-[#e63946]">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Section */}
              <div>
                <label className="text-gray-900 font-medium block mb-2">Location</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleLocate}
                    disabled={locating}
                    className="p-2.5 border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:border-[#e63946] text-gray-600 text-sm"
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
                className="w-full py-3 bg-[#e63946] text-white font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Hero Image */}
        <div className="ml-auto w-[85%] h-[700px] rounded-[32px] overflow-hidden">
          <img
            src={mentorHero}
            alt="Mentor guiding student beside pool"
            className="w-full h-full object-cover"
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