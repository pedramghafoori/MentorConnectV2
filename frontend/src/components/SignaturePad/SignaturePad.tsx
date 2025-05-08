import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import PropTypes from 'prop-types';

interface Props {
  onSave(base64Png: string): void;
  onCancel(): void;
}

const SignaturePad = ({ onSave, onCancel }: Props) => {
  const signatureRef = useRef<any>(null);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const handleSave = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      return;
    }
    const base64Png = signatureRef.current.toDataURL('image/png');
    onSave(base64Png);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'w-full h-[200px] touch-none',
            style: { touchAction: 'none' }
          }}
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33]"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={signatureRef.current?.isEmpty()}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d33] ${
            signatureRef.current?.isEmpty()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#d33] hover:bg-[#c22]'
          }`}
        >
          Save & Accept
        </button>
      </div>
    </div>
  );
};

export default SignaturePad; 