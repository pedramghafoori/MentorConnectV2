import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../features/profile/getProfile';
import { updateProfile } from '../../features/profile/updateProfile';
import { getCertifications } from '../../features/profile/getCertifications';
import AvatarUpload from '../../features/profile/AvatarUpload';
import ReviewsSection from '../../features/profile/ReviewsSection';
import '../../styles/profile.css';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['me'],
    queryFn: getProfile,
  });
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const [about, setAbout] = useState('');
  const [location, setLocation] = useState('Toronto, ON');
  const [isFetchingCerts, setIsFetchingCerts] = useState(false);
  const [lssId, setLssId] = useState('');
  const [isEditingLssId, setIsEditingLssId] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.city && data.province) {
        setLocation(`${data.city}, ${data.province}`);
      }
      if (data.lssId) {
        setLssId(data.lssId);
      }
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d33]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error loading profile: {error.message}</div>;
  }

  const { firstName, lastName, location: oldLocation, avatarUrl, certifications } = data;

  const handleSaveAbout = async () => {
    try {
      await mutation.mutateAsync({ about });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleSaveLocation = async () => {
    try {
      await mutation.mutateAsync({ city: location.split(',')[0].trim(), province: location.split(',')[1].trim() });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleSaveLssId = async () => {
    try {
      await mutation.mutateAsync({ lssId });
      setIsEditingLssId(false);
    } catch (error) {
      console.error('Failed to update LSS ID:', error);
    }
  };

  const handleFetchCertifications = async () => {
    if (!lssId) {
      alert('Please add your LSS ID to your profile first. You can do this by editing your profile.');
      return;
    }
    try {
      setIsFetchingCerts(true);
      const newCerts = await getCertifications(lssId);
      
      // Transform certifications into an array of strings
      const certificationStrings = Object.entries(newCerts.certifications)
        .filter(([_, cert]) => cert.hasCredential)
        .map(([category, cert]) => `${category}: ${cert.yearsOfExperience} years`);
      
      await mutation.mutateAsync({ certifications: certificationStrings });
    } catch (error) {
      console.error('Failed to fetch certifications:', error);
      alert('Failed to fetch certifications. Please try again later.');
    } finally {
      setIsFetchingCerts(false);
    }
  };

  return (
    <div className="profile-container">
      <header className="card">
        <div className="flex items-start space-x-6">
          <AvatarUpload src={avatarUrl} />
          <section className="header-meta">
            <h1>{firstName} {lastName}</h1>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span>Location: </span>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="ml-2 border rounded px-2 py-1"
                >
                  <option value="Toronto, ON">Toronto, ON</option>
                  <option value="Ottawa, ON">Ottawa, ON</option>
                </select>
                <button onClick={handleSaveLocation} className="ml-2 px-2 py-1 bg-[#e63946] text-white rounded">Save</button>
              </p>
              <p className="text-gray-600">
                <span>LSS ID: </span>
                {data.lssId ? (
                  <span className="ml-2">{data.lssId}</span>
                ) : (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={lssId}
                      onChange={(e) => setLssId(e.target.value)}
                      placeholder="Enter your LSS ID"
                      className="ml-2 border rounded px-2 py-1"
                    />
                    <button 
                      onClick={handleSaveLssId}
                      className="ml-2 px-2 py-1 bg-[#e63946] text-white rounded"
                    >
                      Save
                    </button>
                  </div>
                )}
              </p>
            </div>
          </section>
        </div>
      </header>

      <main className="grid">
        <aside className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
            <button 
              onClick={handleFetchCertifications}
              disabled={isFetchingCerts}
              className="px-3 py-1 bg-[#e63946] text-white rounded hover:bg-[#d33] disabled:opacity-50"
            >
              {isFetchingCerts ? 'Fetching...' : 'Fetch Certifications'}
            </button>
          </div>
          <ul className="space-y-2">
            {certifications?.map((cert, index) => (
              <li key={index} className="text-gray-600">{cert}</li>
            ))}
          </ul>
        </aside>

        <section className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
          <textarea
            defaultValue={data.about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell us about yourself..."
          />
          <button onClick={handleSaveAbout}>Save</button>
        </section>
      </main>

      <ReviewsSection userId={data._id} />
    </div>
  );
} 