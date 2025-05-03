import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './utils/canvasPreview';

const ProfilePictureEditor = ({ image, onSave, onCancel, onChangePicture, onDelete }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (onChangePicture) {
        onChangePicture(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    // This is to size the canvas to the size of the cropped image
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = previewCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    const pixelRatio = window.devicePixelRatio;
    previewCanvas.width = completedCrop.width * scaleX;
    previewCanvas.height = completedCrop.height * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Convert canvas to blob
    const blob = await new Promise((resolve) => previewCanvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (blob) {
      onSave(blob);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Edit Profile Picture</h2>
        
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

        <div className="relative mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={image}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
              onLoad={onImageLoad}
              className="max-w-full"
            />
          </ReactCrop>
        </div>

        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Change Picture
            </button>
            <button
              onClick={onDownloadCropClick}
              className="px-4 py-2 text-white bg-[#d33] rounded-lg hover:bg-[#c22] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
        <div className="mb-4">
          <button
            onClick={onDelete}
            className="text-sm text-red-600 hover:underline focus:outline-none bg-transparent p-0"
            style={{ marginTop: '0.5rem' }}
            type="button"
          >
            Delete Picture
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <canvas
          ref={previewCanvasRef}
          style={{
            display: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default ProfilePictureEditor; 