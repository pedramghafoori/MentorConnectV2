import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Assignment } from '../services/assignment.service';

interface AssignmentCardProps {
  assignment: Assignment;
}

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    ACTIVE: 'bg-blue-100 text-blue-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FUTURE: 'bg-violet-100 text-violet-800',
  };

  const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  );
};

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const { menteeId, startDate, status } = assignment;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/mentor/assignments/${assignment._id}`)}
      className="bg-white shadow rounded p-5 flex items-center justify-between hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        <img
          src={menteeId.avatarUrl || '/default-avatar.png'}
          alt={`${menteeId.firstName} ${menteeId.lastName}`}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">
            {menteeId.firstName} {menteeId.lastName}
          </h3>
          <p className="text-gray-600">
            Start Date: {new Date(startDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}; 