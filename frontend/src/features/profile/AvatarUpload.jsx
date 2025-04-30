import React, { useState, useRef } from 'react';

export default function AvatarUpload({ src, isMentor, onImageSelect }) {
  const [previewUrl, setPreviewUrl] = useState(src);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview URL for immediate feedback
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Pass the file to the parent component
    if (onImageSelect) {
      onImageSelect(file);
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