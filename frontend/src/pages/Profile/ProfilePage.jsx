import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getProfileById, sendConnectionRequest, cancelConnectionRequest, getMyConnectionRequests, getConnectionStatus } from '../../features/profile/getProfile';
import { updateProfile } from '../../features/profile/updateProfile';
import { getCertifications } from '../../features/profile/getCertifications';
import AvatarUpload from '../../features/profile/AvatarUpload';
import ReviewsSection from '../../features/profile/ReviewsSection';
import '../../styles/profile.css';
import { useParams } from 'react-router-dom';

const formatCertificationName = (name) => {
  // Handle Instructor Trainer certifications
  if (name.includes('INSTRUCTOR_TRAINER')) {
    if (name.includes('FIRST_AID')) return 'First Aid IT';
    if (name.includes('NL')) return 'NL IT';
    if (name.includes('LIFESAVING')) return 'Lifesaving IT';
    return 'IT';
  }
  
  // Handle other certifications
  return name
    .replace('FIRST_AID_INSTRUCTOR', 'First Aid Instructor')
    .replace('LIFESAVING_INSTRUCTOR', 'Lifesaving Instructor')
    .replace('NL_INSTRUCTOR', 'NL Instructor')
    .replace('EXAMINER_FIRST_AID', 'First Aid Examiner')
    .replace('EXAMINER_NL', 'NL Examiner')
    .replace('EXAMINER_BRONZE', 'Bronze Examiner')
    .replace(/_/g, ' ');
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { userId } = useParams();

  // Determine if this is own profile or public profile
  const isOwnProfile = !userId || user?._id === userId;

  // Fetch profile data
  const { data, isLoading, error } = useQuery({
    queryKey: [isOwnProfile ? 'me' : 'user', userId],
    queryFn: async () => {
      if (isOwnProfile) {
        return await getProfile();
      } else {
        return await getProfileById(userId);
      }
    },
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
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ sent: false, received: false, connected: false });
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

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

  // Helper to check connection status
  const checkConnectionStatus = async () => {
    setCheckingConnection(true);
    try {
      const status = await getConnectionStatus(userId);
      setConnectionStatus(status);
    } catch (err) {
      setConnectionError('Failed to check connection status');
    } finally {
      setCheckingConnection(false);
    }
  };

  useEffect(() => {
    if (!isOwnProfile && userId) {
      checkConnectionStatus();
    }
    // eslint-disable-next-line
  }, [isOwnProfile, userId]);

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

  // Log profile data for debugging
  console.log('Profile data:', data);
  console.log('firstName:', data.firstName);
  console.log('lastName:', data.lastName);

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

  const handleConnectionClick = async () => {
    setConnectionLoading(true);
    setConnectionError('');
    try {
      if (connectionStatus.sent) {
        const res = await cancelConnectionRequest(userId);
        console.log('Cancel response:', res);
      } else {
        const res = await sendConnectionRequest(userId);
        console.log('Send response:', res);
      }
      await checkConnectionStatus();
    } catch (err) {
      setConnectionError('Failed to update connection');
      console.error('Connection error:', err);
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-section">
          {isOwnProfile ? (
            <AvatarUpload src={avatarUrl} isMentor={data.role === 'MENTOR'} />
          ) : (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover"
            />
          )}
        </div>
        <div className="profile-main-info">
          <h1 className="profile-name">{firstName} {lastName}</h1>
          {/* Add Connection Button */}
          {!isOwnProfile && (
            <button
              className={`ml-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${connectionStatus.sent ? 'bg-gray-300 text-gray-600 cursor-pointer' : 'bg-blue-600 text-white hover:bg-blue-700'} ${(checkingConnection || connectionLoading) ? 'opacity-50 cursor-wait' : ''}`}
              onClick={handleConnectionClick}
              disabled={checkingConnection || connectionLoading}
            >
              {connectionLoading ? 'Loading...' : connectionStatus.sent ? 'Pending' : 'Add Connection'}
            </button>
          )}
          {connectionError && (
            <div className="text-red-500 text-xs mt-1">{connectionError}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', height: '2.1rem' }}>
            {data.role === 'MENTOR' && (
              <div className="mentor-label" style={{ height: '2rem', display: 'flex', alignItems: 'center', paddingTop: 0, paddingBottom: 0 }}>
                Certified Mentor
              </div>
            )}
            {/* Location display */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '2rem' }}>
              {!showLocationSelect ? (
                <button
                  className="flex items-center gap-0 px-1 py-0 bg-transparent border-none shadow-none hover:bg-transparent transition cursor-pointer align-middle"
                  style={{ fontWeight: 100, fontSize: '0.95rem', color: '#6b7280', outline: 'none', verticalAlign: 'middle', lineHeight: 1.2, height: '2rem', padding: 0, margin: 0, marginTop: '-15px' }}
                  onClick={() => isOwnProfile && setShowLocationSelect(true)}
                  disabled={!isOwnProfile}
                >
                  {/* Classic location pin SVG */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-400" style={{ display: 'inline', verticalAlign: 'middle', margin: 0, padding: 0 }}>
                    <path d="M12 22s7-7.58 7-12A7 7 0 1 0 5 10c0 4.42 7 12 7 12z" stroke="#9ca3af" strokeWidth="1.5" fill="none"/>
                    <circle cx="12" cy="10" r="2.9" fill="#9ca3af" />
                  </svg>
                  <span style={{ color: '#6b7280', fontSize: '0.95rem', verticalAlign: 'middle', lineHeight: 1.2, margin: 0, padding: 0 }}>
                    {location.split(',')[0]}
                  </span>
                </button>
              ) : (
                isOwnProfile && (
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onBlur={() => { handleSaveLocation(); setShowLocationSelect(false); }}
                    autoFocus
                    className="form-select"
                    style={{ minWidth: 140 }}
                  >
                    <option value="Toronto, ON">Toronto, ON</option>
                    <option value="Ottawa, ON">Ottawa, ON</option>
                  </select>
                )
              )}
            </div>
          </div>
          <div className="profile-meta-row">
            <div className="meta-item">
              <span className="meta-label">LSS ID:</span>
              {isOwnProfile ? (
                data.lssId ? (
                  <span>{data.lssId}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lssId}
                      onChange={(e) => setLssId(e.target.value)}
                      placeholder="Enter your LSS ID"
                      className="form-select"
                    />
                    <button 
                      onClick={handleSaveLssId}
                      className="btn btn-secondary"
                    >
                      Save
                    </button>
                  </div>
                )
              ) : (
                <span>{data.lssId}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="main-content">
          <section className="section-card about-section">
            <div className="section-header">
              <h2 className="section-title">About Me</h2>
              {isOwnProfile && <button onClick={handleSaveAbout} className="btn btn-primary">Save</button>}
            </div>
            {isOwnProfile ? (
              <textarea
                defaultValue={data.about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div style={{ minHeight: 80, color: '#4a5568', fontSize: '1rem' }}>{data.about || <span className="text-gray-400">No bio provided.</span>}</div>
            )}
          </section>

          <section className="section-card">
            <div className="section-header">
              <h2 className="section-title">Reviews</h2>
            </div>
            <ReviewsSection userId={data._id} />
          </section>
        </div>

        <aside>
          <section className="section-card">
            <div className="section-header">
              <h2 className="section-title">Certifications</h2>
              {isOwnProfile && (
                <button 
                  onClick={handleFetchCertifications}
                  disabled={isFetchingCerts}
                  className="btn btn-primary"
                >
                  {isFetchingCerts ? 'Fetching...' : 'Fetch'}
                </button>
              )}
            </div>
            <div className="certifications-grid">
              {certifications?.map((cert, index) => {
                const [name, years] = cert.split(': ');
                return (
                  <div key={index} className="certification-pill">
                    <span className="certification-name">{formatCertificationName(name)}</span>
                    <span className="certification-years">{years}</span>
                  </div>
                );
              })}
              {certifications?.length === 0 && (
                <p className="text-gray-500 text-center py-4">No certifications found. {isOwnProfile && "Click 'Fetch' to load your certifications."}</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
} 