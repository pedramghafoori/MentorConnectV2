import React, { useState, useEffect } from 'react';
import { DriveService } from '../services/drive.service';
import { useAuth } from '../context/AuthContext';

interface DriveFileUploadProps {
  assignmentId?: string;
  section?: 'lessonPlanReview' | 'examPlanReview' | 'dayOfPreparation';
  counterpartEmail?: string;
  onFileUploaded: (fileId: string, fileName: string, webViewLink: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export const DriveFileUpload: React.FC<DriveFileUploadProps> = ({
  assignmentId,
  section,
  counterpartEmail,
  onFileUploaded,
  onError,
  buttonText = 'Upload File',
  className = ''
}) => {
  const [isDriveConnected, setIsDriveConnected] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    checkDriveConnection();
  }, []);

  const checkDriveConnection = async () => {
    try {
      const connected = await DriveService.isDriveConnected();
      setIsDriveConnected(connected);
    } catch (error) {
      console.error('Error checking Drive connection:', error);
      setIsDriveConnected(false);
    }
  };

  const handleConnectDrive = async () => {
    try {
      const authUrl = await DriveService.getAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=600');
      
      // Poll for connection status
      const checkInterval = setInterval(async () => {
        const connected = await DriveService.isDriveConnected();
        if (connected) {
          setIsDriveConnected(true);
          clearInterval(checkInterval);
        }
      }, 2000);

      // Clear interval after 5 minutes
      setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000);
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      onError?.('Failed to connect to Google Drive');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { fileId, fileName, webViewLink } = await DriveService.uploadFile(
        file,
        assignmentId!,
        section!,
        counterpartEmail
      );
      onFileUploaded(fileId, fileName, webViewLink);
    } catch (error) {
      console.error('Error uploading file:', error);
      onError?.('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  if (isDriveConnected === null) {
    return <div>Checking Drive connection...</div>;
  }

  if (!isDriveConnected) {
    return (
      <button
        onClick={handleConnectDrive}
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${className}`}
      >
        Connect Google Drive
      </button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="file"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isUploading ? 'Uploading...' : buttonText}
      </label>
    </div>
  );
}; 