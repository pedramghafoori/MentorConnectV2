import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment } from '../services/assignment.service';
import '../styles/assignments.css';

interface AssignmentCardProps {
  assignment: Assignment;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusClass = `status-badge status-badge-${status.toLowerCase()}`;

  return (
    <span className={statusClass}>
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
      className="assignment-card"
    >
      <div className="assignment-card-content">
        <img
          src={menteeId.avatarUrl || '/default-avatar.png'}
          alt={`${menteeId.firstName} ${menteeId.lastName}`}
          className="assignment-card-avatar"
        />
        <div className="assignment-card-info">
          <h3 className="assignment-card-name">
            {menteeId.firstName} {menteeId.lastName}
          </h3>
          <p className="assignment-card-date">
            Start Date: {new Date(startDate).toLocaleDateString()}
          </p>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}; 