import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface SignedWaiver {
  _id: string;
  waiverText: string;
  signedAt: string;
}

export const SignedWaivers = () => {
  const { user } = useAuth();
  const [waivers, setWaivers] = useState<SignedWaiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWaivers = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        // First verify if the mentor has signed
        const verifyResponse = await api.get(`/waivers/verify/${user._id}`);
        
        if (verifyResponse.data.hasSigned) {
          // If signed, get the signed waiver details
          const response = await api.get(`/waivers/signed`);
          setWaivers(response.data.filter((w: any) => w.mentor && w.mentor._id === user._id));
        } else {
          setWaivers([]);
        }
      } catch (err) {
        setError('Failed to load signed waivers');
        console.error('Error loading waivers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWaivers();
  }, [user?._id]);

  const handleDownload = async (waiverId: string) => {
    try {
      const response = await api.get(`/waivers/${waiverId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MentorConnect-Waiver-${waiverId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading waiver:', err);
      alert('Failed to download waiver');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading signed waivers...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (waivers.length === 0) {
    return <div className="text-gray-500 text-center py-4">No signed waivers found</div>;
  }

  return (
    <div className="space-y-4">
      {waivers.map((waiver) => (
        <div key={waiver._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">Mentor Agreement</h4>
              <p className="text-sm text-gray-500">
                Signed on {format(new Date(waiver.signedAt), 'MMMM d, yyyy')}
              </p>
            </div>
            <button
              onClick={() => handleDownload(waiver._id)}
              className="px-4 py-2 bg-[#d33] text-white rounded-full hover:bg-[#b32] transition-colors"
            >
              Download PDF
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}; 