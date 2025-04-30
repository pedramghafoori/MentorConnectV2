import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './FeaturedUsersCarousel.css';

// Certification hierarchy from highest to lowest
const CERT_HIERARCHY = [
  // Instructor Trainer (all equal)
  'INSTRUCTOR_TRAINER_FIRST_AID',
  'INSTRUCTOR_TRAINER_LIFESAVING',
  'INSTRUCTOR_TRAINER_NL',
  // Examiner Mentor (if you have this as a separate type, add here)
  // Examiner
  'EXAMINER_NL',
  'EXAMINER_FIRST_AID',
  'EXAMINER_BRONZE',
  // Instructor
  'NL_INSTRUCTOR',
  'FIRST_AID_INSTRUCTOR',
  'BRONZE_INSTRUCTOR',
  'SWIM_INSTRUCTOR',
];

const IT_STREAMS = [
  { type: 'INSTRUCTOR_TRAINER_FIRST_AID', label: 'First Aid' },
  { type: 'INSTRUCTOR_TRAINER_LIFESAVING', label: 'Lifesaving' },
  { type: 'INSTRUCTOR_TRAINER_NL', label: 'National Lifeguard' },
];
const EXAMINER_STREAMS = [
  { type: 'EXAMINER_NL', label: 'National Lifeguard' },
  { type: 'EXAMINER_FIRST_AID', label: 'First Aid' },
  { type: 'EXAMINER_BRONZE', label: 'Bronze' },
];

function getHighestCertification(certifications) {
  if (!Array.isArray(certifications)) return null;
  for (const type of CERT_HIERARCHY) {
    const found = certifications.find(cert => cert.type === type);
    if (found) return found.type;
  }
  return certifications[0]?.type || null;
}

function hasAllStreams(userCerts, streamDefs) {
  return streamDefs.every(def => userCerts.some(cert => cert.type === def.type));
}

function getUserStreams(userCerts, streamDefs) {
  return streamDefs.filter(def => userCerts.some(cert => cert.type === def.type)).map(def => def.label);
}

// Helper to get the two highest cert categories
function getTopCategories(userCerts) {
  const hasIT = userCerts.some(cert => cert.type.startsWith('INSTRUCTOR_TRAINER'));
  const hasExaminer = userCerts.some(cert => cert.type.startsWith('EXAMINER'));
  const hasInstructor = userCerts.some(cert => cert.type.endsWith('INSTRUCTOR'));
  const categories = [];
  if (hasIT) categories.push('INSTRUCTOR_TRAINER');
  if (hasExaminer) categories.push('EXAMINER');
  if (hasInstructor) categories.push('INSTRUCTOR');
  return categories.slice(0, 2);
}

const CARDS_TO_SHOW = 3;

const FeaturedUsersCarousel = () => {
  const [users, setUsers] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    axios.get('/api/users/featured')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    if (users.length <= CARDS_TO_SHOW) return;
    intervalRef.current = setInterval(() => {
      setStartIdx(prev => (prev + 1) % users.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [users]);

  if (users.length === 0) return null;

  // Get the 3 users to show, wrapping around if needed
  const getVisibleUsers = () => {
    if (users.length <= CARDS_TO_SHOW) return users;
    const visible = [];
    for (let i = 0; i < CARDS_TO_SHOW; i++) {
      visible.push(users[(startIdx + i) % users.length]);
    }
    return visible;
  };
  const visibleUsers = getVisibleUsers();

  const handlePrev = () => {
    setStartIdx((startIdx - 1 + users.length) % users.length);
  };
  const handleNext = () => {
    setStartIdx((startIdx + 1) % users.length);
  };

  return (
    <div className="featured-carousel-container">
      <h2 className="featured-carousel-title">Featured Profiles</h2>
      <div className="featured-carousel multi">
        <button
          className="carousel-arrow left"
          onClick={handlePrev}
          aria-label="Previous"
        >&#8592;</button>
        <div className="featured-cards-wrapper">
          {visibleUsers.map((user, idx) => {
            const userCerts = user.certifications || [];
            const topCategories = getTopCategories(userCerts);
            // Instructor Trainer section
            const itHasAll = hasAllStreams(userCerts, IT_STREAMS);
            const itStreams = getUserStreams(userCerts, IT_STREAMS);
            // Examiner section
            const exHasAll = hasAllStreams(userCerts, EXAMINER_STREAMS);
            const exStreams = getUserStreams(userCerts, EXAMINER_STREAMS);
            // Instructor section
            const instrStreams = userCerts.filter(cert => cert.type.endsWith('INSTRUCTOR')).map(cert => {
              if (cert.type === 'NL_INSTRUCTOR') return 'National Lifeguard';
              if (cert.type === 'FIRST_AID_INSTRUCTOR') return 'First Aid';
              if (cert.type === 'BRONZE_INSTRUCTOR') return 'Bronze';
              if (cert.type === 'SWIM_INSTRUCTOR') return 'Swim';
              return cert.type.replace('_INSTRUCTOR', '').replace(/_/g, ' ');
            });
            return (
              <div
                key={user._id}
                className={`featured-card profile-style${idx === 1 && visibleUsers.length === 3 ? ' featured-card-center' : ''}`}
              >
                <div className="carousel-profile-img-wrapper">
                  <img
                    src={user.avatarUrl || '/default-avatar.png'}
                    alt={user.firstName}
                    className="carousel-profile-img"
                  />
                </div>
                <div className="carousel-profile-content">
                  <div className="carousel-profile-header">
                    <span className="carousel-profile-name">{user.firstName}</span>
                    {user.role === 'MENTOR' ? (
                      <span className="mentor-badge profile-badge">Mentor</span>
                    ) : (
                      <span className="mentor-badge profile-badge placeholder-badge" aria-hidden="true"></span>
                    )}
                  </div>
                  {topCategories.length === 0 && (
                    <div className="carousel-section">
                      <div className="carousel-section-title">No certifications</div>
                    </div>
                  )}
                  {topCategories.map((cat, i) => (
                    <React.Fragment key={cat}>
                      {cat === 'INSTRUCTOR_TRAINER' && (
                        <div className="carousel-section">
                          <div className="carousel-section-title">Instructor Trainer:</div>
                          <div className="carousel-section-streams">
                            {itHasAll ? 'All streams' : itStreams.length > 0 ? itStreams.join(', ') : <span className="carousel-section-none">None</span>}
                          </div>
                        </div>
                      )}
                      {cat === 'EXAMINER' && (
                        <div className="carousel-section">
                          <div className="carousel-section-title">Examiner:</div>
                          <div className="carousel-section-streams">
                            {exHasAll ? 'All streams' : exStreams.length > 0 ? exStreams.join(', ') : <span className="carousel-section-none">None</span>}
                          </div>
                        </div>
                      )}
                      {cat === 'INSTRUCTOR' && (
                        <div className="carousel-section">
                          <div className="carousel-section-title">Instructor:</div>
                          <div className="carousel-section-streams">
                            {instrStreams.length > 0 ? instrStreams.join(', ') : <span className="carousel-section-none">None</span>}
                          </div>
                        </div>
                      )}
                      {/* Divider between the two categories, but not after the last */}
                      {topCategories.length > 1 && i === 0 && <div className="carousel-divider" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="carousel-arrow right"
          onClick={handleNext}
          aria-label="Next"
        >&#8594;</button>
      </div>
      <div className="carousel-dots">
        {users.map((_, idx) => (
          <span
            key={idx}
            className={`carousel-dot${idx === startIdx ? ' active' : ''}`}
            onClick={() => setStartIdx(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedUsersCarousel; 