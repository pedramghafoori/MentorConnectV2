import React from 'react';
import './threeProngApproach.css';

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
  return (
    <section className="three-prong-section">
      {/* Three‑prong icon */}
      <div className="icon-wrap">
        <svg
          width="120"
          height="90"
          viewBox="0 0 64 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M32 48V0" stroke="#e63946" strokeWidth="6" strokeLinecap="round" />
          <path d="M12 48V12" stroke="#e63946" strokeWidth="6" strokeLinecap="round" />
          <path d="M52 48V12" stroke="#e63946" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="heading">Our Three‑Pronged Approach</h2>

      <ul className="prong-list">
        {DATA.map((item, idx) => (
          <li key={idx}>
            <ProngBubble title={item.title} description={item.description} />
          </li>
        ))}
      </ul>
    </section>
  );
};

const ProngBubble = ({ title, description }) => {
  return (
    <div
      className="prong-bubble"
      tabIndex={0}
    >
      <h3 className="prong-title">{title}</h3>
      <p className="prong-description">{description}</p>
    </div>
  );
};

export default OurThreeProngedApproach;
