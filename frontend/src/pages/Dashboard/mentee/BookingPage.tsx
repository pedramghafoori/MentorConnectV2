import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import BookingTerms from '../../../components/BookingTerms';

const BookingPage = () => {
  const { mentorId } = useParams();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/mentors/${mentorId}`);
      return data;
    },
  });

  const handlePayment = async () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to proceed with booking.');
      return;
    }

    setIsProcessing(true);
    try {
      const { data } = await axios.post('/api/bookings', {
        mentorId,
        termsAccepted,
      });
      // Handle successful booking
      window.location.href = data.paymentUrl;
    } catch (error) {
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!mentor) {
    return <div>Mentor not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4 mb-6">
          {mentor.avatarUrl && (
            <img
              src={mentor.avatarUrl}
              alt={mentor.firstName}
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mentor.firstName} {mentor.lastName}
            </h2>
            <p className="text-gray-500">{mentor.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Session Details</h3>
            <p className="text-gray-600">
              Duration: 1 hour
              <br />
              Price: ${mentor.mentorProfile.prepSupportFee} CAD
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">What to Prepare</h3>
            <ul className="list-disc list-inside text-gray-600">
              {mentor.mentorProfile.prepRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <BookingTerms
            cancellationPolicyHours={mentor.mentorProfile.cancellationPolicyHours}
            onAccept={setTermsAccepted}
          />

          <button
            onClick={handlePayment}
            disabled={!termsAccepted || isProcessing}
            className="w-full bg-[#d33] text-white py-3 rounded-lg font-semibold hover:bg-[#b22] transition disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Pay & Book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage; 