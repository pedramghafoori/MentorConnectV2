import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getProfileById, sendConnectionRequest, cancelConnectionRequest, getMyConnectionRequests, getConnectionStatus, removeConnection } from '../../features/profile/getProfile';
import { updateProfile } from '../../features/profile/updateProfile';
import { getCertifications } from '../../features/profile/getCertifications';
import AvatarUpload from '../../features/profile/AvatarUpload';
import ReviewsSection from '../../features/profile/ReviewsSection';
import ImageModal from '../../components/ImageModal';
import ProfilePictureEditor from '../../components/ProfilePictureEditor';
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
  const [showRemoveDropdown, setShowRemoveDropdown] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleRemoveConnection = async () => {
    setConnectionLoading(true);
    setConnectionError('');
    try {
      await removeConnection(userId);
      setShowRemoveDropdown(false);
      setShowRemoveConfirm(false);
      await checkConnectionStatus();
    } catch (err) {
      setConnectionError('Failed to remove connection');
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target.result);
      setShowProfileEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfilePicture = async (blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', blob, 'profile-picture.jpg');
      
      await mutation.mutateAsync({
        profilePicture: formData,
      });
      
      setShowProfileEditor(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-section">
          {isOwnProfile ? (
            <AvatarUpload
              src={data?.profilePicture || data?.avatarUrl}
              isMentor={data?.isMentor}
              onImageSelect={handleImageSelect}
            />
          ) : (
            <div 
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={data?.profilePicture || data?.avatarUrl}
                alt={`${data?.firstName} ${data?.lastName}'s profile`}
                className="w-40 h-40 rounded-full object-cover"
              />
            </div>
          )}
        </div>
        <div className="profile-main-info">
          <div className="flex items-center gap-4">
            <h1 className="profile-name">{firstName} {lastName}</h1>
            {/* Add Connection Button */}
            {!isOwnProfile && (
              connectionStatus.connected ? (
                <div className="relative inline-block">
                  <button
                    className="connection-button bg-green-700 text-white"
                    onClick={() => setShowRemoveDropdown((v) => !v)}
                    disabled={connectionLoading}
                  >
                    Connected
                  </button>
                  {showRemoveDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => { setShowRemoveDropdown(false); setShowRemoveConfirm(true); }}
                      >
                        Remove Connection
                      </button>
                    </div>
                  )}
                  {showRemoveConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
                        <div className="text-lg font-semibold mb-4">Remove Connection?</div>
                        <div className="text-gray-700 mb-6">Are you sure you want to remove this connection?</div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            onClick={() => setShowRemoveConfirm(false)}
                          >Cancel</button>
                          <button
                            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            onClick={handleRemoveConnection}
                            disabled={connectionLoading}
                          >{connectionLoading ? 'Removing...' : 'Remove'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : connectionStatus.sent ? (
                <div className="relative inline-block">
                  <button
                    className="connection-button bg-gray-300 text-gray-600"
                    onClick={handleConnectionClick}
                    disabled={checkingConnection || connectionLoading}
                  >
                    {connectionLoading ? 'Loading...' : 'Pending'}
                  </button>
                </div>
              ) : (
                <div className="relative inline-block">
                  <button
                    className="connection-button bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleConnectionClick}
                    disabled={checkingConnection || connectionLoading}
                  >
                    {connectionLoading ? 'Loading...' : 'Add Connection'}
                  </button>
                </div>
              )
            )}
            {connectionError && (
              <div className="text-red-500 text-xs mt-1">{connectionError}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', height: '2.1rem' }}>
            {data.role === 'MENTOR' && (
              <div className="mentor-badge">
                Certified Mentor
              </div>
            )}
            {/* Location display */}
            <div className="location-wrapper">
              {!showLocationSelect ? (
                <button
                  className="location-text"
                  onClick={() => isOwnProfile && setShowLocationSelect(true)}
                  disabled={!isOwnProfile}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s7-7.58 7-12A7 7 0 1 0 5 10c0 4.42 7 12 7 12z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <circle cx="12" cy="10" r="2.9" fill="currentColor" />
                  </svg>
                  <span>
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

      {/* Image Modal for viewing other users' profile pictures */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={data?.profilePicture || data?.avatarUrl}
        altText={`${data?.firstName} ${data?.lastName}'s profile picture`}
      />

      {/* Profile Picture Editor for editing own profile picture */}
      {showProfileEditor && (
        <ProfilePictureEditor
          image={selectedImage}
          onSave={handleSaveProfilePicture}
          onCancel={() => {
            setShowProfileEditor(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
} 