import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/assignments/${assignment._id}`)}
      className="assignment-card"
    >
      <div className="assignment-card-content">
        <img
          src={assignment.menteeId.avatarUrl || '/default-avatar.png'}
          alt={`${assignment.menteeId.firstName} ${assignment.menteeId.lastName}`}
          className="assignment-card-avatar"
        />
        <div className="assignment-card-info">
          <h3 className="assignment-card-name">
            {assignment.menteeId.firstName} {assignment.menteeId.lastName}
        </h3>
          <p className="assignment-card-date">
            Start Date: {new Date(assignment.startDate).toLocaleDateString()}
          </p>
          <StatusBadge status={assignment.status} />
        </div>
      </div>
    </div>
  );
}; 