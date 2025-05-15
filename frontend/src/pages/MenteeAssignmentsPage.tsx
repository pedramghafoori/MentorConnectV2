import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { AssignmentService, Assignment } from '../services/assignment.service';
import { MenteeAssignmentCard } from '../components/MenteeAssignmentCard';
import { Spinner } from '../components/Spinner';
import { initializeSocket } from '../services/socket';
import { Socket } from 'socket.io-client';
import '../styles/assignments.css';

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
        const socket: Socket | undefined = initializeSocket(user._id);
        if (!socket) {
          console.warn('Socket initialization failed');
          return;
        }
        
        socket.on('connect_error', (error: Error) => {
          console.error('Socket connection error:', error);
          setSocketError('Failed to connect to real-time updates. The page will still work, but updates may be delayed.');
        });

        socket.on('assignment:update', () => {
          queryClient.invalidateQueries({ queryKey: ['assignments', currentTab] });
        });

        return () => {
          if (socket) {
            socket.off('assignment:update');
            socket.off('connect_error');
          }
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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading assignments. Please try again later.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {socketError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{socketError}</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <div className="flex space-x-4">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded ${
                currentTab === key ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setCurrentTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-600">
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