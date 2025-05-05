import React from 'react';
import locationPin from '../assets/icons/location-pin.png';
import calendarIcon from '../assets/icons/calendar.svg';
import clipboardIcon from '../assets/icons/clipboard.svg';

export default function OpportunityCard({ opportunity }) {
  const mentor = opportunity.mentor || {};
  const facility = opportunity.facility || {};
  const prepReqs = opportunity.prepRequirements || [];
  const date = opportunity.schedule?.isExamOnly
    ? opportunity.schedule.examDate
    : (opportunity.schedule?.courseDates?.[0] || null);

  return (
    <div className="opportunity-card">
      <div className="opportunity-card-main">
        <div className="opportunity-card-header">
          <span className="opportunity-card-title">{opportunity.title}</span>
        </div>
        <div className="opportunity-card-details">
          <div className="opportunity-card-detail-row">
            <img src={locationPin} alt="Location" className="opportunity-card-icon" />
            <span className="opportunity-card-detail-text">{facility.name || opportunity.city || 'N/A'}</span>
          </div>
          <div className="opportunity-card-detail-row">
            <img src={calendarIcon} alt="Date" className="opportunity-card-icon" />
            <span className="opportunity-card-detail-text">{date ? new Date(date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="opportunity-card-detail-row">
            <span className="opportunity-card-icon" style={{fontWeight: 'bold', fontSize: '1.2rem'}}>$</span>
            <span className="opportunity-card-detail-text">{opportunity.price ? `$${opportunity.price}` : 'N/A'}</span>
          </div>
          <button className="opportunity-card-apply-btn">Apply</button>
        </div>
      </div>
      <div className="opportunity-card-expectations">
        <div className="opportunity-card-clipboard">
          <img src={clipboardIcon} alt="Expectations" />
        </div>
        <div className="opportunity-card-expectation-list">
          {prepReqs.length > 0 ? (
            prepReqs.map((req, i) => (
              <div key={i} className="opportunity-card-expectation">{req}</div>
            ))
          ) : (
            <div className="opportunity-card-expectation">No expectations listed</div>
          )}
        </div>
      </div>
      <div className="opportunity-card-mentor">
        <div className="opportunity-card-mentor-label">About the Mentor</div>
        <img src={mentor.avatarUrl || '/default-avatar.png'} alt="Mentor" className="opportunity-card-mentor-avatar" />
        <div className="opportunity-card-mentor-name">{mentor.firstName} {mentor.lastName}</div>
        <div className="opportunity-card-mentor-years">{mentor.yearsOfExperience || '[Years]'} Years of Experience</div>
      </div>
    </div>
  );
} 