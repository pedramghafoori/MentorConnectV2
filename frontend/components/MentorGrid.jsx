import React, { useState } from 'react';
import './MentorCard.css';

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

export default function MentorGrid({ mentors, opportunitiesByMentor }) {
  const [expanded, setExpanded] = useState({});

  const handleToggle = (mentorId) => {
    setExpanded((prev) => ({
      ...prev,
      [mentorId]: !prev[mentorId],
    }));
  };

  return (
    <div className="mentor-list">
      {mentors.map(mentor => {
        const certs = Array.isArray(mentor.certifications) ? mentor.certifications : [];
        // Sort certifications by years descending
        const sortedCerts = [...certs].sort((a, b) => (b.years || 0) - (a.years || 0));
        const showAll = expanded[mentor._id];
        const certsToShow = showAll ? sortedCerts : sortedCerts.slice(0, 3);
        const maxYears = certs.length > 0 ? Math.max(...certs.map(cert => cert.years || 0)) : null;

        return (
          <div className="mentor-card" key={mentor._id}>
            <img
              src={mentor.avatarUrl || '/default-avatar.png'}
              alt={mentor.firstName}
              className="mentor-card-avatar"
            />
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
            </div>
          </div>
        );
      })}
    </div>
  );
} 