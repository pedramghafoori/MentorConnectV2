import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserSearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse certifications from query param
  const params = new URLSearchParams(location.search);
  let certs = [];
  try {
    certs = params.get('certifications') ? JSON.parse(decodeURIComponent(params.get('certifications'))) : [];
  } catch (e) {
    certs = [];
  }

  useEffect(() => {
    if (!certs.length) return;
    setLoading(true);
    setError('');
    axios.get(`/api/users/search?certifications=${encodeURIComponent(JSON.stringify(certs))}`)
      .then(res => setResults(res.data))
      .catch(() => setError('Error searching users'))
      .finally(() => setLoading(false));
  }, [location.search]);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Mentors with Selected Certifications</h1>
      {loading && <div className="text-gray-500 py-8 text-center">Loading...</div>}
      {error && <div className="text-red-500 py-8 text-center">{error}</div>}
      {!loading && !error && results.length === 0 && (
        <div className="text-gray-400 py-8 text-center">No users found.</div>
      )}
      <div className="space-y-4">
        {results.map(user => (
          <div
            key={user._id}
            className="flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <img
              src={user.avatarUrl || '/default-avatar.png'}
              alt={user.firstName}
              className="w-14 h-14 rounded-full object-cover bg-gray-200"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-lg truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user.lssId}
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.certifications?.map(cert => (
                  <span key={cert.type} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {cert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSearchResults; 