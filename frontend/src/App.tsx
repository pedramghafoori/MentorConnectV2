import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MentorAssignmentsPage } from './pages/MentorAssignmentsPage';
import { AssignmentLayout } from './pages/assignment/AssignmentLayout';

// ... existing imports and code ...

export const App = () => {
  return (
    <Routes>
      {/* ... existing routes ... */}
      <Route path="/mentor/assignments" element={<MentorAssignmentsPage />} />
      <Route path="/mentor/assignments/:id/*" element={<AssignmentLayout />} />
      {/* ... existing routes ... */}
    </Routes>
  );
}; 