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
const POSITIONS = ['far-left', 'left', 'center', 'right', 'far-right'];
const AUTO_SLIDE_MS = 3_000;

export default function FeaturedUsersCarousel() {
  const [users, setUsers] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const slideTimer = useRef(null);

  /* fetch once */
  useEffect(() => {
    axios.get('/api/users/featured')
      .then(res => {
        console.log('featured users count:', res.data.length);
        setUsers(res.data);
      })
      .catch(() => setUsers([]));
  }, []);

  /* auto-advance */
  useEffect(() => {
    if (users.length <= POSITIONS.length) return;
    slideTimer.current = setInterval(
      () => setStartIdx(i => (i + 1) % users.length),
      AUTO_SLIDE_MS,
    );
    return () => clearInterval(slideTimer.current);
  }, [users]);

  if (users.length === 0) return null;

  /* handlers */
  const prev = () => setStartIdx(i => (i - 1 + users.length) % users.length);
  const next = () => setStartIdx(i => (i + 1) % users.length);

  return (
    <div className="featured-carousel-container">
      <h2 className="featured-carousel-title">Featured&nbsp;Profiles</h2>

      <div className="featured-carousel">
        <button className="carousel-arrow left" onClick={prev}>&#8592;</button>

        <div className="featured-cards-wrapper">
          {POSITIONS.map((pos, slotIdx) => {
            const user = users[(startIdx + slotIdx) % users.length];
            const certs = user.certifications || [];
            const top = getTopCategories(certs);

            // Map category keys to display labels
            const categoryLabels = {
              'INSTRUCTOR_TRAINER': 'Instructor Trainer',
              'EXAMINER': 'Examiner',
              'INSTRUCTOR': 'Instructor',
            };

            return (
              <div key={pos} className={`featured-card profile-style carousel-${pos}`}>
                <div className={`featured-card-inner scale-${pos}`}>
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