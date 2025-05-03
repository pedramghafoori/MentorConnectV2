import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './utils/canvasPreview';

const ProfilePictureEditor = ({ image, onSave, onCancel, onChangePicture, onDelete, initialCrop }) => {
  const editorSize = 320; // Define editor size constant

  // Convert initial relative offset to pixels for editor state
  const initialPixelOffset = initialCrop?.offset 
    ? { x: initialCrop.offset.x * editorSize, y: initialCrop.offset.y * editorSize } 
    : { x: 0, y: 0 };

  const [scale, setScale] = useState(initialCrop?.scale || 1);
  const [rotate, setRotate] = useState(initialCrop?.rotate || 0);
  const [offset, setOffset] = useState(initialPixelOffset); // Use pixel offset internally
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
    const newPixelOffset = { x: lastOffset.current.x + dx, y: lastOffset.current.y + dy };
    setOffset(clampOffset(newPixelOffset, scale));
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

  // Helper to get image natural size and fit it in the circle
  const getDefaultOffsetAndScale = (img) => {
    if (!img) return { offset: { x: 0, y: 0 }, scale: 1 };
    const containerSize = 320;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(containerSize / iw, containerSize / ih);
    // Center the image
    const x = 0;
    const y = 0;
    return { offset: { x, y }, scale };
  };

  // Only apply default fit/center if no initialCrop
  React.useEffect(() => {
    // Use pixel offset for default calculation as well
    if (imgRef.current && imageLoaded && !initialCrop) {
      const { offset: defaultPixelOffset, scale: defaultScale } = getDefaultOffsetAndScale(imgRef.current);
      setOffset(defaultPixelOffset);
      setScale(defaultScale);
    }
    // eslint-disable-next-line
  }, [imageLoaded, initialCrop]);

  // Clamp function continues to work with pixel offsets
  const clampOffset = (pixelOffset, scale) => {
    if (!imgRef.current) return pixelOffset;
    const containerSize = editorSize; // Use editorSize
    const iw = imgRef.current.naturalWidth * scale;
    const ih = imgRef.current.naturalHeight * scale;
    const minX = Math.min(0, containerSize / 2 - iw / 2);
    const maxX = Math.max(0, iw / 2 - containerSize / 2);
    const minY = Math.min(0, containerSize / 2 - ih / 2);
    const maxY = Math.max(0, ih / 2 - containerSize / 2);
    return {
      x: Math.max(minX, Math.min(pixelOffset.x, maxX)),
      y: Math.max(minY, Math.min(pixelOffset.y, maxY)),
    };
  };

  // Update offset (pixels) when dragging or zooming
  React.useEffect(() => {
    setOffset((prevPixelOffset) => clampOffset(prevPixelOffset, scale));
    // eslint-disable-next-line
  }, [scale]);

  // Fetch image as blob if editing an existing image (URL)
  React.useEffect(() => {
    if (image && typeof image === 'string' && !originalFile && imageLoaded) {
      // Only fetch if it's a URL (not a data URL or File)
      if (!image.startsWith('data:')) {
        fetch(image)
          .then(res => res.blob())
          .then(blob => {
            // Try to preserve the file type and name
            const file = new File([blob], 'profile-picture', { type: blob.type });
            setOriginalFile(file);
          });
      }
    }
    // eslint-disable-next-line
  }, [image, imageLoaded]);

  // Convert pixel offset to relative offset ON SAVE
  async function onDownloadCropClick() {
    if (!originalFile || !imageLoaded) return;
    const relativeOffset = {
      x: offset.x / editorSize,
      y: offset.y / editorSize,
    };
    onSave(originalFile, {
      offset: relativeOffset, // Save relative offset
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
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // Use the internal pixel offset state for editor preview
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale}) rotate(${rotate}deg)`
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