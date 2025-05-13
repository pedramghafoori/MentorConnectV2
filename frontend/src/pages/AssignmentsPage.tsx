import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MentorAssignmentsPage } from './MentorAssignmentsPage';
import { MenteeAssignmentsPage } from './MenteeAssignmentsPage';
import '../styles/assignments.css';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'mentee' | 'mentor'>('mentee');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'mentee' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('mentee')}
          >
            As Mentee
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'mentor' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setActiveView('mentor')}
          >
            As Mentor
          </button>
        </div>
      </div>

      {activeView === 'mentee' ? (
        <MenteeAssignmentsPage />
      ) : (
        <MentorAssignmentsPage />
      )}
    </div>
  );
}; 