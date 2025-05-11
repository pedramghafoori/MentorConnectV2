import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import locationPin from '../assets/icons/location-pin.png';
import calendarIcon from '../assets/icons/calendar.svg';
import clipboardIcon from '../assets/icons/clipboard.svg';
import ReusableModal from './ReusableModal';
import ApplyModal from './ApplyModal';

export default function OpportunityCard({ opportunity, hideRibbon }) {
  const { user } = useAuth();
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const mentor = opportunity.mentor || {};
  const facility = opportunity.facility || {};
  const prepReqs = opportunity.prepRequirements || [];
  const date = opportunity.schedule?.isExamOnly
    ? opportunity.schedule.examDate
    : (opportunity.schedule?.courseDates?.[0] || null);

  // Add debug logging
  const handleApplyClick = () => {
    console.log('Apply button clicked');
    setApplyModalOpen(true);
    console.log('applyModalOpen set to:', true);
  };

  // Map course titles to display names
  const getDisplayTitle = (title) => {
    switch (title) {
      case 'NL IT':
        return 'National Lifeguard Instructor Course';
      case 'Lifesaving IT':
        return 'Lifesaving Instructor Course';
      case 'SWI IT':
        return 'Swim Instructor Course';
      case 'First Aid IT':
        return 'First Aid Instructor Course';
      default:
        return title;
    }
  };

  return (
    <>
      <ReusableModal isOpen={mentorModalOpen} onClose={() => setMentorModalOpen(false)} title="About the Mentor" maxWidth="max-w-md">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: mentorModalOpen ? 'fadeInScale 0.3s' : 'fadeOutScale 0.3s' }}>
          <img
            src={mentor.avatarUrl || '/default-avatar.png'}
            alt="Mentor Large"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb', marginBottom: 16 }}
          />
          <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: 4 }}>{mentor.firstName} {mentor.lastName}</div>
          <div style={{ color: '#6b7280', fontSize: '1.05rem', marginBottom: 8 }}>{mentor.yearsOfExperience || '[Years]'} Years of Experience</div>
          {/* Add more mentor info here if available */}
        </div>
      </ReusableModal>
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        opportunity={opportunity}
      />
      <div className="opportunity-card">
        {!hideRibbon && (
          <div className="opportunity-card-ribbon">
            <span className="opportunity-card-ribbon-title">{getDisplayTitle(opportunity.title)}</span>
            {opportunity.opid && (
              <span className="opportunity-card-ribbon-opid">{opportunity.opid}</span>
            )}
          </div>
        )}
        <div className="opportunity-card-inner">
          <div className="opportunity-card-top">
            <div className="opportunity-card-main">
              <div className="opportunity-card-details">
              <div className="details-heading">Details</div>
                <div className="opportunity-card-detail-row">
                  <img src={locationPin} alt="Location" className="opportunity-card-icon" />
                  <span className="opportunity-card-detail-text">
                    {facility.name || opportunity.city || 'N/A'}{facility.address && (', ' + facility.address)}
                  </span>
                </div>
                <div className="opportunity-card-detail-row">
                  <img src={calendarIcon} alt="Date" className="opportunity-card-icon" />
                  <span className="opportunity-card-detail-text">{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="opportunity-card-detail-row">
                  <svg
                    className="opportunity-card-icon"
                    viewBox="0 0 480 480"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Price"
                  >
                    <g>
                      <g>
                        <path d="M155.2,241.7c66.7,0,120.8-54.1,120.8-120.8S221.9,0,155.2,0S34.4,54.1,34.4,120.8S88.5,241.7,155.2,241.7z M113,168.6
                          c1.1-4,2.2-7.9,3.4-11.9c1.4-4.6,2.7-5.1,6.9-2.9c7.2,3.7,14.8,5.8,22.8,6.8c5.1,0.6,10.2,0.1,14.9-2c8.9-3.9,10.3-14.2,2.8-20.4
                          c-2.6-2.1-5.5-3.7-8.5-5c-7.8-3.4-15.9-6-23.3-10.4c-11.9-7.1-19.5-17-18.6-31.5c1-16.4,10.3-26.7,25.3-32.1
                          c6.2-2.3,6.2-2.2,6.3-8.7c0-2.2,0-4.4,0-6.6c0.1-4.9,1-5.7,5.8-5.9c1.5,0,3,0,4.5,0c10.4,0,10.4,0,10.4,10.4c0,7.3,0,7.4,7.3,8.5
                          c5.6,0.9,10.9,2.5,16.1,4.8C192,63,193,65,192.2,68c-1.3,4.5-2.5,9-4,13.4c-1.4,4.2-2.7,4.8-6.7,2.9c-8.1-3.9-16.6-5.6-25.6-5.1
                          c-2.4,0.1-4.6,0.4-6.8,1.4c-7.7,3.4-9,11.9-2.4,17.2c3.3,2.7,7.1,4.6,11.1,6.2c6.8,2.8,13.7,5.6,20.3,9.2
                          c20.7,11.5,26.3,37.5,11.7,55.2c-5.3,6.4-12.1,10.7-20.2,12.9c-3.5,1-5.1,2.8-4.9,6.4c0.2,3.6,0,7.1,0,10.7c0,3.2-1.6,4.9-4.8,5
                          c-3.8,0.1-7.7,0.1-11.5,0c-3.4-0.1-5-2-5-5.3c0-2.6,0-5.2-0.1-7.8c-0.1-5.7-0.2-6-5.8-6.9c-7.1-1.1-14-2.7-20.5-5.9
                          C112.1,175.2,111.6,173.9,113,168.6z" />
                        <path d="M426.2,251.8h-14.1l0,0c-9.3-28.5-27.5-53.8-51.8-73.4c0-0.9-0.2-1.9-0.4-2.8c-5.1-17.9,1.2-34.2,8.5-45.9
                          c5.1-8.2-1.5-18.7-11.1-17.5c-21.5,2.7-36.3,10.6-46.5,19.5c-7,6.1-12,14.3-14.2,23.4c-15.4,63.8-72.9,111.3-141.4,111.3
                          c-33.3,0-63.9-11.2-88.4-30c-8.5,18.4-13.1,38.5-13.1,59.6c0,11.4,1.4,22.5,4,33.2l0,0c0,0,0,0.2,0.1,0.5
                          c2.7,11.1,6.8,21.8,12,31.9c6.9,14.9,16.9,32.3,30.7,46.4c19.9,20.5,23.3,45.9,23.8,56.9v4.7c0,0.2,0,0.4,0,0.6c0,0.1,0,0.1,0,0.1
                          l0,0c0.4,5.4,4.9,9.7,10.4,9.7h63.2c5.7,0,10.4-4.6,10.4-10.4V454c9.2,1.2,18.6,1.9,28.1,1.9c7.5,0,14.8-0.4,22.1-1.2v14.9
                          c0,5.7,4.6,10.4,10.4,10.4h63.4c5.7,0,10.4-4.6,10.4-10.4V454c0.1-5.2,1.9-25.9,21.5-43.6c0.7-0.6,1.4-1.2,2.1-1.8
                          c0.2-0.2,0.4-0.3,0.6-0.5l0,0c21.8-19.4,37.9-43.6,46.2-70.6h13.3c10.6,0,19.2-8.6,19.2-19.2V271
                          C445.4,260.4,436.8,251.8,426.2,251.8z M347.1,255.2c-8.7,0-15.7-7-15.7-15.7s7-15.7,15.7-15.7s15.7,7,15.7,15.7
                          C362.8,248.2,355.8,255.2,347.1,255.2z" />
                      </g>
                    </g>
                  </svg>
                  <span className="opportunity-card-detail-text">
                    {opportunity.price === 0 ? 'No charge' : (opportunity.price ? `$${opportunity.price}` : 'N/A')}
                  </span>
                </div>
                {user && (
                  <button
                    className="opportunity-card-apply-btn"
                    onClick={handleApplyClick}
                  >
                    Apply
                  </button>
                )}
                {!user && (
                  <button
                    className="opportunity-card-apply-btn"
                    onClick={() => {
                      localStorage.setItem('redirectAfterLogin', window.location.href);
                      window.dispatchEvent(new Event('open-login-modal'));
                    }}
                    style={{ fontWeight: 700 }}
                  >
                    Sign in to apply
                  </button>
                )}
              </div>
            </div>
            <div className="opportunity-card-mentor">
              <div className="opportunity-card-mentor-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                About the Mentor
                <button
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onClick={() => setMentorModalOpen(true)}
                  aria-label="View mentor details"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 5L12 10L7 15" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <img src={mentor.avatarUrl || '/default-avatar.png'} alt="Mentor" className="opportunity-card-mentor-avatar" />
              <div className="opportunity-card-mentor-name">{mentor.firstName} {mentor.lastName}</div>
              <div className="opportunity-card-mentor-years">{mentor.yearsOfExperience || '[Years]'} Years of Experience</div>
            </div>
          </div>
          <div className="opportunity-card-bottom">
            <div className="responsibilities-heading">Mentor's Expectations</div>
            <div className="responsibilities-support-text">You are expected to prepare the following for this opportunity (ask the mentor for help if needed).</div>
            <div className="prep-requirements-container">
              <img src={clipboardIcon} alt="Requirements" style={{width: '32px', height: '32px', opacity: 0.8, marginRight: '0.5rem'}} />
              {prepReqs.length > 0 ? (
                prepReqs.map((req, i) => (
                  <div key={i} className="prep-requirement-pill">
                    {req}
                  </div>
                ))
              ) : (
                <div className="prep-requirement-pill">
                  No requirements listed
                </div>
              )}
            </div>
            <div className="opportunity-bottom-row">
              <div className="notes-box">
                <div className="notes-title">Notes from mentor</div>
                <div>{opportunity.notes || '[Notes]'}</div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 