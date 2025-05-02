/* --------------  FeaturedUsersCarousel.jsx -------------- */
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../css/FeaturedUsersCarousel.css';

/* ──────────────────────────────────────────────────────────
   Helper tables (unchanged from your original component)
   ------------------------------------------------------ */

const CERT_HIERARCHY = [
  'INSTRUCTOR_TRAINER_FIRST_AID',
  'INSTRUCTOR_TRAINER_LIFESAVING',
  'INSTRUCTOR_TRAINER_NL',
  'EXAMINER_NL',
  'EXAMINER_FIRST_AID',
  'EXAMINER_BRONZE',
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

/* helpers */
function hasAllStreams(userCerts, streamDefs) {
  return streamDefs.every(def => userCerts.some(cert => cert.type === def.type));
}
function getUserStreams(userCerts, streamDefs) {
  return streamDefs
    .filter(def => userCerts.some(cert => cert.type === def.type))
    .map(def => def.label);
}
function getTopCategories(userCerts) {
  const hasIT = userCerts.some(c => c.type.startsWith('INSTRUCTOR_TRAINER'));
  const hasExam = userCerts.some(c => c.type.startsWith('EXAMINER'));
  const hasInstr = userCerts.some(c => c.type.endsWith('INSTRUCTOR'));
  const cats = [];
  if (hasIT) cats.push('INSTRUCTOR_TRAINER');
  if (hasExam) cats.push('EXAMINER');
  if (hasInstr) cats.push('INSTRUCTOR');
  return cats.slice(0, 2);
}

/* slot identifiers – these elements never leave the DOM */
const DESKTOP_POSITIONS = ['far-left', 'left', 'center', 'right', 'far-right'];
const MOBILE_POSITIONS = ['left', 'center', 'right'];
const AUTO_SLIDE_MS = 5000; // Time between slides
const TRANSITION_DURATION_MS = 1000; // Duration of the transition animation

// Define transform values for each position
const POSITION_TRANSFORMS = {
  'far-left': {
    transform: 'translate(-200%, 0) scale(0.7) skewY(2deg)',
    opacity: 0.38,
    zIndex: 0,
    filter: 'blur(3px) brightness(0.9)',
    pointerEvents: 'none',
  },
  'left': {
    transform: 'translate(-150%, 0) scale(0.85) skewY(2deg)',
    opacity: 0.68,
    zIndex: 1,
    filter: 'blur(1px) brightness(0.95)',
    pointerEvents: 'auto',
  },
  'center': {
    transform: 'translate(-50%, 0) scale(1.12)',
    opacity: 1,
    zIndex: 3,
    filter: 'none',
    pointerEvents: 'auto',
    boxShadow: '0 12px 40px rgba(230,57,70,.18), 0 2px 8px rgba(0,0,0,.08)',
  },
  'right': {
    transform: 'translate(50%, 0) scale(0.85) skewY(-2deg)',
    opacity: 0.68,
    zIndex: 1,
    filter: 'blur(1px) brightness(0.95)',
    pointerEvents: 'auto',
  },
  'far-right': {
    transform: 'translate(100%, 0) scale(0.7) skewY(-2deg)',
    opacity: 0.38,
    zIndex: 0,
    filter: 'blur(3px) brightness(0.9)',
    pointerEvents: 'none',
  }
};

export default function FeaturedUsersCarousel() {
  const [users, setUsers] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);
  const [isPaused, setIsPaused] = useState(false);
  const slideTimer = useRef(null);

  /* Handle window resize */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* fetch once */
  useEffect(() => {
    axios.get('/api/users/featured')
      .then(res => {
        const featuredUsers = res.data.filter(user => user.allowFeatured !== false);
        console.log('featured users count:', featuredUsers.length);
        setUsers(featuredUsers);
      })
      .catch(() => setUsers([]));
  }, []);

  /* auto-advance */
  useEffect(() => {
    const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
    if (users.length <= positions.length || isPaused) {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
        slideTimer.current = null;
      }
      return;
    }

    slideTimer.current = setInterval(
      () => setStartIdx(i => (i + 1) % users.length),
      AUTO_SLIDE_MS,
    );

    return () => {
      if (slideTimer.current) {
        clearInterval(slideTimer.current);
      }
    };
  }, [users, isMobile, isPaused]);

  if (users.length === 0) return null;

  /* handlers */
  const prev = () => setStartIdx(i => (i - 1 + users.length) % users.length);
  const next = () => setStartIdx(i => (i + 1) % users.length);

  const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;

  // Calculate visible users and their positions
  const visibleUsers = positions.map((pos, idx) => {
    const userIndex = (startIdx + idx) % users.length;
    return {
      user: users[userIndex],
      position: pos,
      index: idx
    };
  });

  // Map category keys to display labels
  const categoryLabels = {
    'INSTRUCTOR_TRAINER': 'Instructor Trainer',
    'EXAMINER': 'Examiner',
    'INSTRUCTOR': 'Instructor',
  };

  return (
    <div className="featured-carousel-container">
      <h2 className="featured-carousel-title">Experience & Passion Connected</h2>

      <div 
        className="featured-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button className="carousel-arrow left" onClick={prev}>&#8592;</button>

        <div className="featured-cards-wrapper">
          {visibleUsers.map(({ user, position, index }) => {
            const certs = user.certifications || [];
            const top = getTopCategories(certs);

            return (
              <div 
                key={user._id}
                className="featured-card profile-style"
                data-position={position}
                data-index={index}
              >
                <div className="featured-card-inner">
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
                      <span className={`mentor-badge profile-badge${user.role === 'MENTOR' ? '' : ' invisible-badge'}`}>Mentor</span>
                    </div>

                    <div className="carousel-category-badges">
                      {top.length === 0 ? (
                        <span className="carousel-category-text none">No certifications</span>
                      ) : (
                        <div className="carousel-category-text-list">
                          {top.map(cat => (
                            <div key={cat} className="carousel-category-text">
                              {categoryLabels[cat] || cat}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="carousel-arrow right" onClick={next}>&#8594;</button>
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
}