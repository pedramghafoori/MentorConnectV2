import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface SignedWaiver {
  _id: string;
  waiver: {
    title: string;
  };
  signedAt: string;
}

export const SignedWaivers: React.FC = () => {
  const [signedWaivers, setSignedWaivers] = useState<SignedWaiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSignedWaivers();
  }, []);

  const fetchSignedWaivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/waivers/signed');
      setSignedWaivers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch signed waivers');
      console.error('Error fetching signed waivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async (waiverId: string) => {
    try {
      const response = await api.get(`/api/waivers/${waiverId}/pdf`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
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
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  if (signedWaivers.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No signed waivers found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Signed Waivers</h2>
      <div className="grid gap-4">
        {signedWaivers.map((waiver) => (
          <Card key={waiver._id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{waiver.waiver.title}</h3>
                <p className="text-sm text-gray-500">
                  Signed on {format(new Date(waiver.signedAt), 'MMMM d, yyyy')}
                </p>
              </div>
              <Button
                onClick={() => downloadPdf(waiver._id)}
                variant="outline"
              >
                Download PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 