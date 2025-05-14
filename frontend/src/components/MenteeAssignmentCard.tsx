import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export const MenteeAssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const { mentorId, startDate, status } = assignment;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/mentee/assignments/${assignment._id}`)}
      className="assignment-card"
    >
      <div className="assignment-card-content">
        <img
          src={mentorId.avatarUrl || '/default-avatar.png'}
          alt={`${mentorId.firstName} ${mentorId.lastName}`}
          className="assignment-card-avatar"
        />
        <div className="assignment-card-info">
          <h3 className="assignment-card-name">
            {mentorId.firstName} {mentorId.lastName}
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