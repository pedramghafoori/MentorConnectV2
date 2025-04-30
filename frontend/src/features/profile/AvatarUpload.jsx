import React, { useState, useRef } from 'react';
import { uploadPicture } from './uploadPicture';
import api from '../../lib/api';

export default function AvatarUpload({ src, isMentor }) {
  const [previewUrl, setPreviewUrl] = useState(src);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      setIsUploading(true);
      console.log('Uploading file:', file);
      const newUrl = await uploadPicture(file);
      console.log('Upload response URL:', newUrl);
      // Persist the new avatar URL to the user's profile
      const patchRes = await api.patch('/users/me', { avatarUrl: newUrl });
      console.log('PATCH /users/me response:', patchRes.data);
      setPreviewUrl(newUrl);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setPreviewUrl(src); // Revert to original on error
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div 
        className="w-40 h-40 rounded-full overflow-hidden cursor-pointer relative"
        onClick={handleClick}
      >
        <img
          src={previewUrl}
          alt="Profile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm">
            Change
          </span>
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
} 