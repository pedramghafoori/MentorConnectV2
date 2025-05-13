import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

export const AssignmentLayout = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="checklist" replace />} />
      {/* Add other assignment-related routes here */}
    </Routes>
  );
}; 