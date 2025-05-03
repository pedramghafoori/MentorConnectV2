import React from 'react';

const COLORS = [
  '#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#a8dadc', '#b5838d', '#ffb4a2'
];

function getColorFromName(name) {
  if (!name) return COLORS[0];
  // Simple hash to pick a color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function AvatarFallback({ firstName, size = 48, className = '' }) {
  const letter = firstName ? firstName[0].toUpperCase() : '?';
  const bgColor = getColorFromName(firstName);

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bgColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.5,
        userSelect: 'none',
      }}
    >
      {letter}
    </div>
  );
}
