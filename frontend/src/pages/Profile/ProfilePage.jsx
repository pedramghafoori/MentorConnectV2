import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../features/profile/getProfile';
import { updateProfile } from '../../features/profile/updateProfile';
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

  const { firstName, lastName, location, avatarUrl, certifications } = data;

  const handleSaveAbout = async () => {
    try {
      await mutation.mutateAsync({ about });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="profile-container">
      <header className="card">
        <div className="flex items-start space-x-6">
          <AvatarUpload src={avatarUrl} />
          <section className="header-meta">
            <h1>{firstName} {lastName}</h1>
            <p className="text-gray-600 mt-1">{location}</p>
            {/* TODO: Add rating stars component */}
          </section>
        </div>
      </header>

      <main className="grid">
        <aside className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications</h2>
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