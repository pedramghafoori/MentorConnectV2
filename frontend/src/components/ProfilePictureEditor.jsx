import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './utils/canvasPreview';

const ProfilePictureEditor = ({ image, onSave, onCancel, onChangePicture, onDelete }) => {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastOffset = useRef({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);

  // Handle drag to move image
  const handleMouseDown = (e) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastOffset.current = { ...offset };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: lastOffset.current.x + dx, y: lastOffset.current.y + dy });
  };
  const handleMouseUp = () => {
    dragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (onChangePicture) {
        onChangePicture(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  async function onDownloadCropClick() {
    if (!originalFile || !imageLoaded) return;
    onSave(originalFile, {
      offset,
      scale,
      rotate
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
          type="button"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Profile Picture</h2>
        {image ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rotate</label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="relative mb-4 flex items-center justify-center" style={{ height: 320 }}>
              <div
                style={{
                  width: 320,
                  height: 320,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  cursor: 'grab',
                }}
                onMouseDown={handleMouseDown}
              >
                <img
                  ref={imgRef}
                  src={image}
                  alt="Profile preview"
                  style={{
                    width: 320 * scale,
                    height: 320 * scale,
                    transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg)`,
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                  draggable={false}
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Circular mask is the container itself */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    border: '2px dashed #d33',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={onDelete}
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg bg-transparent hover:bg-red-50 focus:outline-none transition-colors"
                type="button"
              >
                Delete
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-white bg-[#d33] rounded-lg hover:bg-[#c22] transition-colors"
                >
                  Upload
                </button>
                <button
                  onClick={onDownloadCropClick}
                  className="px-4 py-2 text-white bg-[#d33] rounded-lg hover:bg-[#c22] transition-colors"
                  disabled={!imageLoaded}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-white bg-[#d33] rounded-lg hover:bg-[#c22] transition-colors"
            >
              Upload
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ProfilePictureEditor; 