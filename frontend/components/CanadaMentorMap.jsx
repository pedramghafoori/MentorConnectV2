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
      <h2 style={{ fontWeight: 700, fontSize: '2.5rem', marginBottom: 30 }}>Mentors Across Canada</h2>
      <div style={{
        position: 'relative',
        width: 900,
        height: 600,
        margin: '0 auto',
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
                left: x - 8,
                top: y - 8,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#e63946',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 2 + i,
                transition: 'transform 0.2s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CanadaMentorMap; 