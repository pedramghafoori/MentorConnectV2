import React from 'react';
import canadaMap from '../src/assets/canada-map.png'; // You need to provide a Canada map image in assets

// Helper: Simple equirectangular projection for Canada
const project = (lat, lng, width, height) => {
  // Canada bounds (approx):
  // lat: 41 (south) to 83 (north), lng: -141 (west) to -52 (east)
  const minLat = 41, maxLat = 83, minLng = -141, maxLng = -52;
  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * height;
  return { x, y };
};

const CanadaMentorMap = ({ users, width = 700, height = 500 }) => {
  console.log(users);
  console.log(users.map((user) => ({
    ...user,
    ...project(user.latitude, user.longitude, width, height)
  })));

  return (
    <div style={{ width: 900, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ fontWeight: 700, fontSize: '2.5rem', marginBottom: 24 }}>Mentors Across Canada</h2>
      <div style={{
        position: 'relative',
        width: 900,
        height: 600,
        margin: '0 auto',
        background: '#f8f9fa',
        borderRadius: 24,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <img
          src={canadaMap}
          alt="Canada Map"
          style={{ width: 900, height: 600, objectFit: 'contain', display: 'block' }}
        />
        {users.map((user, i) => {
          const { x, y } = project(user.latitude, user.longitude, 900, 600);
          return (
            <div
              key={user._id}
              title={`${user.firstName} ${user.lastName}`}
              style={{
                position: 'absolute',
                left: x - 32,
                top: y - 32,
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                background: '#eee',
                zIndex: 2 + i,
                transition: 'transform 0.2s',
              }}
            >
              <img
                src={user.avatarUrl}
                alt={user.firstName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CanadaMentorMap; 