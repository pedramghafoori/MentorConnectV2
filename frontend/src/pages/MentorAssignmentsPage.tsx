import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { AssignmentService } from '../services/assignment.service';
import { AssignmentCard } from '../components/AssignmentCard';
import { Spinner } from '../components/Spinner';
import { initializeSocket, getSocket } from '../services/socket';
import '../styles/assignments.css';

interface Assignment {
  _id: string;
  menteeId: {
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

export const MentorAssignmentsPage = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'active' | 'future' | 'completed'>('active');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      const socket = initializeSocket(user._id);
      socket.on('assignment:update', () => {
        queryClient.invalidateQueries({ queryKey: ['assignments', currentTab] });
      });

      return () => {
        socket.off('assignment:update');
      };
    }
  }, [user, currentTab, queryClient]);

  const { data: assignments = [], isLoading, error } = useQuery({
    queryKey: ['assignments', currentTab],
    queryFn: () => AssignmentService.getMentorAssignments(currentTab),
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded ${
              currentTab === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setCurrentTab('active')}
          >
            Active
          </button>
          <button
            className={`px-4 py-2 rounded ${
              currentTab === 'future' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setCurrentTab('future')}
          >
            Future
          </button>
          <button
            className={`px-4 py-2 rounded ${
              currentTab === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setCurrentTab('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center text-gray-600">
          No assignments found for this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment._id}
              assignment={assignment}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 