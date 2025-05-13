import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { AssignmentService } from '../services/assignment.service';
import { MenteeAssignmentCard } from '../components/MenteeAssignmentCard';
import { initializeSocket } from '../services/socket';
import '../styles/assignments.css';

interface Assignment {
  _id: string;
  mentorId: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  startDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED' | 'CANCELED' | 'CHARGED';
}

const TABS = [
  { key: 'active', label: 'Active Assignments' },
  { key: 'future', label: 'Future Assignments' },
  { key: 'completed', label: 'Completed' },
] as const;

type TabKey = typeof TABS[number]['key'];

export const MenteeAssignmentsPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabKey>('active');
  const [socketError, setSocketError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      try {
        const socket = initializeSocket(user._id);
        
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setSocketError('Failed to connect to real-time updates. The page will still work, but updates may be delayed.');
        });

        socket.on('assignment:update', () => {
          queryClient.invalidateQueries({ queryKey: ['assignments', currentTab] });
        });

        return () => {
          socket.off('assignment:update');
          socket.off('connect_error');
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        setSocketError('Failed to initialize real-time updates. The page will still work, but updates may be delayed.');
      }
    }
  }, [user, currentTab, queryClient]);

  const { data: assignments = [], isLoading, error } = useQuery({
    queryKey: ['assignments', currentTab],
    queryFn: () => AssignmentService.getMenteeAssignments(currentTab),
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        Loading assignments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Error loading assignments. Please try again later.
      </div>
    );
  }

  return (
    <div className="page-container">
      {socketError && (
        <div className="warning-message">
          {socketError}
        </div>
      )}
      <div className="page-header">
        <h1>My Assignments</h1>
        <div className="tabs-container">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`tab-button ${currentTab === key ? 'active' : ''}`}
              onClick={() => setCurrentTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          No assignments found for this category.
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((assignment: Assignment) => (
            <MenteeAssignmentCard
              key={assignment._id}
              assignment={assignment}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 