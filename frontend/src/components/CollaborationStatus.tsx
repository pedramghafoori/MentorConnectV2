import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import { AssignmentCollaborationService } from '../services/assignmentCollaboration.service';

interface CollaborationStatusProps {
  assignmentId: string;
  initialStatus: {
    lessonPlanReview: { completed: boolean; lastUpdatedAt: string };
    examPlanReview: { completed: boolean; lastUpdatedAt: string };
    dayOfPreparation: { completed: boolean; lastUpdatedAt: string };
  };
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  assignmentId,
  initialStatus
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const socket = getSocket();

  useEffect(() => {
    // Join assignment room
    AssignmentCollaborationService.joinAssignmentRoom(assignmentId);

    // Listen for collaboration updates
    socket.on('collaboration:update', (update) => {
      setStatus(prev => ({
        ...prev,
        [update.taskType]: {
          completed: update.completed,
          lastUpdatedAt: update.lastUpdatedAt
        }
      }));
    });

    // Listen for errors
    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      socket.off('collaboration:update');
      socket.off('error');
      AssignmentCollaborationService.leaveAssignmentRoom(assignmentId);
    };
  }, [assignmentId, socket]);

  const handleTaskToggle = async (taskType: string) => {
    try {
      const newStatus = !status[taskType as keyof typeof status].completed;
      await AssignmentCollaborationService.updateTaskStatus(assignmentId, taskType, newStatus);
    } catch (error) {
      setError('Failed to update task status');
      setTimeout(() => setError(null), 5000);
    }
  };

  const tasks = [
    {
      key: 'lessonPlanReview',
      label: 'Lesson Plan Review',
      description: 'Review and approve the lesson plan'
    },
    {
      key: 'examPlanReview',
      label: 'Exam Plan Review',
      description: 'Review and approve the exam plan'
    },
    {
      key: 'dayOfPreparation',
      label: 'Day of Preparation',
      description: 'Final preparation checklist'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Collaboration Status</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {tasks.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <h3 className="font-medium">{label}</h3>
              <p className="text-sm text-gray-600">{description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(status[key as keyof typeof status].lastUpdatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  status[key as keyof typeof status].completed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status[key as keyof typeof status].completed ? 'Completed' : 'Pending'}
              </span>
              <button
                onClick={() => handleTaskToggle(key)}
                className={`px-4 py-2 rounded ${
                  status[key as keyof typeof status].completed
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {status[key as keyof typeof status].completed ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 