import React, { useState } from 'react';
import './MentorCard.css';
import { useAuth } from '../src/context/AuthContext';

const formatCertificationName = (name) => {
  if (!name) return '';
  if (name.includes('INSTRUCTOR_TRAINER')) {
    if (name.includes('FIRST_AID')) return 'First Aid IT';
    if (name.includes('NL')) return 'NL IT';
    if (name.includes('LIFESAVING')) return 'Lifesaving IT';
    return 'IT';
  }
  return name
    .replace('FIRST_AID_INSTRUCTOR', 'First Aid Instructor')
    .replace('LIFESAVING_INSTRUCTOR', 'Lifesaving Instructor')
    .replace('NL_INSTRUCTOR', 'NL Instructor')
    .replace('EXAMINER_FIRST_AID', 'First Aid Examiner')
    .replace('EXAMINER_NL', 'NL Examiner')
    .replace('EXAMINER_BRONZE', 'Bronze Examiner')
    .replace(/_/g, ' ');
};

const StarRating = ({ rating }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<span key={i} className="star filled">★</span>);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<span key={i} className="star half-filled">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">★</span>);
    }
  }

  return <div className="star-rating">{stars}</div>;
};

const ReviewList = ({ reviews }) => {
  return (
    <div className="review-list">
      {reviews.map((review, index) => (
        <div key={index} className="review-item">
          <div className="review-header">
            <span className="reviewer-name">{review.reviewerName}</span>
            <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
          </div>
          <div className="review-rating">
            <StarRating rating={review.rating} />
          </div>
          <p className="review-text">{review.text}</p>
        </div>
      ))}
    </div>
  );
};

export default function MentorGrid({ mentors, opportunitiesByMentor }) {
  const [expanded, setExpanded] = useState({});
  const [savedMentors, setSavedMentors] = useState(new Set());
  const { user } = useAuth();

  const handleToggle = (mentorId) => {
    setExpanded((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  const handleSaveMentor = async (mentorId) => {
    if (!user) return;
    try {
      if (savedMentors.has(mentorId)) {
        await api.delete(`/api/saved-mentors/${mentorId}`);
        setSavedMentors(prev => {
          const newSet = new Set(prev);
          newSet.delete(mentorId);
          return newSet;
        });
      } else {
        await api.post('/api/saved-mentors', { mentorId });
        setSavedMentors(prev => new Set(prev).add(mentorId));
      }
    } catch (error) {
      console.error('Error saving mentor:', error);
    }
  };

  const findSimilarMentors = (mentor, allMentors) => {
    const similarMentors = allMentors.filter(m => {
      if (m._id === mentor._id) return false;
      const mentorCerts = new Set(mentor.certifications?.map(c => c.type) || []);
      const mCerts = new Set(m.certifications?.map(c => c.type) || []);
      const commonCerts = [...mentorCerts].filter(cert => mCerts.has(cert));
      return commonCerts.length > 0;
    }).slice(0, 3);
    return similarMentors;
  };

  return (
    <div className="mentor-list">
      {mentors.map(mentor => {
        const certs = Array.isArray(mentor.certifications) ? mentor.certifications : [];
        const sortedCerts = [...certs].sort((a, b) => (b.years || 0) - (a.years || 0));
        const showAll = expanded[mentor._id];
        const certsToShow = showAll ? sortedCerts : sortedCerts.slice(0, 3);
        const maxYears = certs.length > 0 ? Math.max(...certs.map(cert => cert.years || 0)) : null;
        const similarMentors = findSimilarMentors(mentor, mentors);

        return (
          <div className="mentor-card" key={mentor._id}>
            <div className="mentor-card-avatar-col">
              <img
                src={mentor.avatarUrl || '/default-avatar.png'}
                alt={mentor.firstName}
                className="mentor-card-avatar"
              />
              <div className="examiner-badge">
                <span className="checkmark">&#10003;</span> Examiner Mentor
              </div>
            </div>
            <div className="mentor-card-info">
              <div className="mentor-card-header">
                <span className="mentor-card-name">{mentor.firstName} {mentor.lastName}</span>
                <span className="mentor-card-opps">
                  {opportunitiesByMentor?.[mentor._id]?.length || 0} Opportunities
                </span>
                {maxYears !== null && (
                  <span className="mentor-card-years">Years of Experience: {maxYears}</span>
                )}
              </div>
              <div className="mentor-card-certs">
                {certsToShow.length > 0 ? (
                  <div className="mentor-card-certs-list">
                    {certsToShow.map((cert, idx) => (
                      <span key={idx} className="mentor-card-cert-pill">
                        {formatCertificationName(cert.type)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="mentor-card-no-certs">No certifications listed</span>
                )}
                {certs.length > 3 && !showAll && (
                  <div className="mentor-card-see-all-row">
                    <button
                      className="mentor-card-see-all"
                      onClick={() => handleToggle(mentor._id)}
                      type="button"
                    >
                      See all certifications
                    </button>
                  </div>
                )}
                {certs.length > 3 && showAll && (
                  <div className="mentor-card-see-all-row">
                    <button
                      className="mentor-card-see-all"
                      onClick={() => handleToggle(mentor._id)}
                      type="button"
                    >
                      Show less
                    </button>
                  </div>
                )}
              </div>
              <div className="mentor-card-actions">
                <button className="action-button contact">Contact</button>
                <button className="action-button book">Book Session</button>
                {user && (
                  <button 
                    className={`action-button save ${savedMentors.has(mentor._id) ? 'saved' : ''}`}
                    onClick={() => handleSaveMentor(mentor._id)}
                  >
                    {savedMentors.has(mentor._id) ? 'Saved' : 'Save'}
                  </button>
                )}
              </div>
              <div className="mentor-card-ratings">
                <StarRating rating={mentor.averageRating || 0} />
                <button 
                  className="reviews-link"
                  onClick={() => handleToggle(mentor._id)}
                >
                  {mentor.reviews?.length || 0} reviews
                </button>
              </div>
              {expanded[mentor._id] && mentor.reviews && (
                <div className="mentor-card-reviews">
                  <ReviewList reviews={mentor.reviews} />
                </div>
              )}
              {similarMentors.length > 0 && (
                <div className="similar-mentors">
                  <h4>Similar Mentors</h4>
                  <div className="similar-mentors-list">
                    {similarMentors.map(similar => (
                      <div key={similar._id} className="similar-mentor">
                        <img 
                          src={similar.avatarUrl || '/default-avatar.png'} 
                          alt={similar.firstName}
                          className="similar-mentor-avatar"
                        />
                        <span className="similar-mentor-name">
                          {similar.firstName} {similar.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 