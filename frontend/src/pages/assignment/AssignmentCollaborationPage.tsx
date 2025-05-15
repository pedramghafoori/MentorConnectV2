import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DriveFileUpload } from '../../components/DriveFileUpload';
import { ChatBox } from '../../components/ChatBox';
import { CollaborationStatus } from '../../components/CollaborationStatus';
import { AssignmentCollaborationService } from '../../services/assignmentCollaboration.service';
import { Assignment } from '../../models/assignment';
import { AssignmentMessage } from '../../models/assignmentMessage';

export const AssignmentCollaborationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [messages, setMessages] = useState<AssignmentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/assignments');
      return;
    }

    const fetchAssignment = async () => {
      try {
        const data = await AssignmentCollaborationService.getAssignmentById(id);
        setAssignment(data);
      } catch (err) {
        setError('Failed to load assignment');
        console.error('Error fetching assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessages = async () => {
      try {
        const data = await AssignmentCollaborationService.getMessages(id);
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchAssignment();
    fetchMessages();
  }, [id, navigate]);

  const handleFileUploaded = async (
    fileId: string,
    fileName: string,
    webViewLink: string,
    section: 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation'
  ) => {
    try {
      const updatedAssignment = await AssignmentCollaborationService.updateAssignmentFile(
        id!,
        section,
        fileId,
        webViewLink
      );
      setAssignment(updatedAssignment);
    } catch (err) {
      setError('Failed to update assignment');
      console.error('Error updating assignment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'Assignment not found'}</div>
      </div>
    );
  }

  const isMentor = user?.role === 'MENTOR';
  const counterpart = isMentor ? assignment.menteeId : assignment.mentorId;
  const counterpartName = `${counterpart.firstName} ${counterpart.lastName}`;
  const counterpartEmail = counterpart.email;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Assignment: {assignment.opportunityId.title}
        </h1>
        <p className="text-gray-600">
          {isMentor ? 'Mentee' : 'Mentor'}: {counterpartName}
        </p>
      </div>

      {/* Progress Tracker */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Progress</h2>
        <CollaborationStatus
          assignmentId={id!}
          initialStatus={{
            lessonPlanReview: assignment.lessonPlanReview,
            examPlanReview: assignment.examPlanReview,
            dayOfPreparation: assignment.dayOfPreparation
          }}
        />
      </div>

      {/* Collaboration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Lesson Plan Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Lesson Plan Review</h2>
            {!assignment.lessonPlanReview.driveFileId ? (
              <DriveFileUpload
                assignmentId={id}
                section="lessonPlanReview"
                counterpartEmail={counterpartEmail}
                onFileUploaded={(fileId, fileName, webViewLink) =>
                  handleFileUploaded(fileId, fileName, webViewLink, 'lessonPlanReview')
                }
                buttonText={isMentor ? 'Waiting for lesson plan...' : 'Upload Lesson Plan'}
                className={isMentor ? 'opacity-50 cursor-not-allowed' : ''}
              />
            ) : (
              <div>
                <a
                  href={assignment.lessonPlanReview.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Lesson Plan
                </a>
                {isMentor && !assignment.lessonPlanReview.completed && (
                  <button
                    onClick={() =>
                      AssignmentCollaborationService.updateTaskStatus(
                        id!,
                        'lessonPlanReview',
                        true
                      )
                    }
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Exam Plan Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Exam Plan Review</h2>
            {!assignment.examPlanReview.driveFileId ? (
              <DriveFileUpload
                assignmentId={id}
                section="examPlanReview"
                counterpartEmail={counterpartEmail}
                onFileUploaded={(fileId, fileName, webViewLink) =>
                  handleFileUploaded(fileId, fileName, webViewLink, 'examPlanReview')
                }
                buttonText={isMentor ? 'Waiting for exam plan...' : 'Upload Exam Plan'}
                className={isMentor ? 'opacity-50 cursor-not-allowed' : ''}
              />
            ) : (
              <div>
                <a
                  href={assignment.examPlanReview.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Exam Plan
                </a>
                {isMentor && !assignment.examPlanReview.completed && (
                  <button
                    onClick={() =>
                      AssignmentCollaborationService.updateTaskStatus(
                        id!,
                        'examPlanReview',
                        true
                      )
                    }
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Day of Preparation Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Day of Preparation</h2>
            {!assignment.dayOfPreparation.driveFileId ? (
              <DriveFileUpload
                assignmentId={id}
                section="dayOfPreparation"
                counterpartEmail={counterpartEmail}
                onFileUploaded={(fileId, fileName, webViewLink) =>
                  handleFileUploaded(fileId, fileName, webViewLink, 'dayOfPreparation')
                }
                buttonText="Upload Preparation Notes"
              />
            ) : (
              <div>
                <a
                  href={assignment.dayOfPreparation.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Preparation Notes
                </a>
                {isMentor && !assignment.dayOfPreparation.completed && (
                  <button
                    onClick={() =>
                      AssignmentCollaborationService.updateTaskStatus(
                        id!,
                        'dayOfPreparation',
                        true
                      )
                    }
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Mark as Ready
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="bg-white rounded-lg shadow">
          <ChatBox assignmentId={id!} initialMessages={messages} />
        </div>
      </div>
    </div>
  );
}; 