import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorAssignmentsPage } from './MentorAssignmentsPage';
import { MenteeAssignmentsPage } from './MenteeAssignmentsPage';
import '../styles/assignments.css';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'mentee' | 'mentor'>('mentee');

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">My Assignments</h1>
      <p className="dashboard-description">View and manage your assignments as a mentee or mentor.</p>
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeView === 'mentee' ? 'active' : ''}`}
          onClick={() => setActiveView('mentee')}
        >
          As Mentee
        </button>
        <button
          className={`tab-button ${activeView === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveView('mentor')}
        >
          As Mentor
        </button>
      </div>
      <div className="dashboard-content">
        {activeView === 'mentee' ? (
          <MenteeAssignmentsPage />
        ) : (
          <MentorAssignmentsPage />
        )}
      </div>
    </div>
  );
}; 