import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SignaturePad from '../SignaturePad/SignaturePad';
import api from '../../lib/api';

interface Props {
  isOpen: boolean;
  onClose(): void;
  onSigned(signedWaiverId: string): void;
}

const WaiverModal = ({ isOpen, onClose, onSigned }: Props) => {
  const [waiverText, setWaiverText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchWaiver = async () => {
        console.log('WaiverModal: Starting to fetch waiver...');
        try {
          console.log('WaiverModal: Making API request to /waivers/latest');
          const response = await api.get('/waivers/latest');
          console.log('WaiverModal: API response received:', response);
          setWaiverText(response.data.text);
        } catch (err) {
          console.error('WaiverModal: Error fetching waiver:', err);
          console.error('WaiverModal: Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setError('Failed to load waiver text');
        } finally {
          setLoading(false);
        }
      };
      fetchWaiver();
    }
  }, [isOpen]);

  const handleSignatureSave = async (base64Png: string) => {
    try {
      const response = await api.post('/waivers/sign', {
        signaturePng: base64Png
      });
      onSigned(response.data.signedWaiverId);
    } catch (err) {
      setError('Failed to save signature');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mentor Waiver</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading waiver text...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="space-y-6">
              <div className="max-h-[300px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{waiverText}</pre>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Please sign below:</h3>
                <SignaturePad
                  onSave={handleSignatureSave}
                  onCancel={onClose}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaiverModal; 