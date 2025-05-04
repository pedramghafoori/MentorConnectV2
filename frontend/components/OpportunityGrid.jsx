import React from 'react';

export default function OpportunityGrid({ opportunities }) {
  return (
    <div className="opportunity-grid">
      {opportunities.map(opp => (
        <div key={opp._id} className="opportunity-card">
          <div className="opportunity-title">{opp.title}</div>
          <div className="opportunity-notes">{opp.notes}</div>
        </div>
      ))}
    </div>
  );
} 