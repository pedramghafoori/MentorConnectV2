import React, { useState } from 'react';
import './ThreeProngApproach.css';
import ProngArrow from '../assets/ProngArrow.svg';

/**
 * Our Three‑Pronged Approach — interactive version
 * -------------------------------------------------
 * • Three "bubbles" that expand on hover (or focus) to reveal the description.
 * • Pure inline styles + minimal React state; no external CSS required.
 */

const DATA = [
  {
    title: 'Erase the friction',
    description:
      'Every certified mentor in one searchable map with instant booking. No emails, no waiting—just found.',
  },
  {
    title: 'Reward the guidance',
    description:
      'Mentors earn for their prep time; mentees invest a fraction of the income their new certification unlocks. Everybody wins.',
  },
  {
    title: 'Streamline the journey',
    description:
      'Digital logbooks and progress checkpoints carry you from first session to final exam—no lost paperwork.',
  },
];

const OurThreeProngedApproach = () => {
  const [activeBubble, setActiveBubble] = useState(null);

  return (
    <>
      
      <section className="three-prong-section">
        {/* Three‑prong icon */}
        <div className="icon-wrap">
          <svg
            width="120"
            height="110"
            viewBox="0 0 64 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M32 48V0" stroke="#e63946" strokeWidth="8" strokeLinecap="round" />
            <path d="M14 48V15" stroke="#e63946" strokeWidth="8" strokeLinecap="round" />
            <path d="M50 48V15" stroke="#e63946" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
        <div className="why-mentorconnect">
          <div className="philosophy-arrow-wrap">
            <h2 className="Our-Pilosophy-heading">
              Finding a mentor should have always been easy.
            </h2>
            <h2 className="Our-Pilosophy-punchline">
              Now it is.
            </h2>
          </div>
          <div className="our-philosophy-divider"></div>
        </div>
        <h2 className="heading">Our Three‑Pronged Approach</h2>
        <p className="why-mentorconnect-desc">
          Talented instructor-candidates don't fail for lack of skill; they fail for lack of access. MentorConnect was built to remove that roadblock and make the certification journey as simple—and rewarding—as it should have been all along.
        </p>

        <ul className="prong-list">
          {DATA.map((item, idx) => (
            <li key={idx}>
              <ProngBubble 
                title={item.title} 
                description={item.description} 
                isActive={activeBubble === idx}
                onTouchStart={() => setActiveBubble(idx)}
                onTouchEnd={() => setActiveBubble(null)}
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

const ProngBubble = ({ title, description, isActive, onTouchStart, onTouchEnd }) => {
  return (
    <div
      className={`prong-bubble ${isActive ? 'active' : ''}`}
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <h3 className="prong-title">{title}</h3>
      <p className="prong-description">{description}</p>
    </div>
  );
};

export default OurThreeProngedApproach;
