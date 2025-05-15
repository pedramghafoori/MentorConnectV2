import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment } from '../models/assignment';

interface AssignmentCardProps {
  assignment: Assignment;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/assignments/${assignment._id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {assignment.title}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
            assignment.status
          )}`}
        >
          {assignment.status}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{assignment.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          <span className="font-medium">Mentee:</span>{' '}
          {assignment.mentee.firstName} {assignment.mentee.lastName}
        </div>
        <div>
          <span className="font-medium">Created:</span>{' '}
          {new Date(assignment.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}; 