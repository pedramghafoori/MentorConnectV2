import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { MentorAssignmentsPage } from './pages/assignment/MentorAssignmentsPage';
import { MenteeAssignmentsPage } from './pages/assignment/MenteeAssignmentsPage';
import { AssignmentCollaborationPage } from './pages/assignment/AssignmentCollaborationPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/assignments"
              element={
                <PrivateRoute>
                  <MentorAssignmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/assignments/:id"
              element={
                <PrivateRoute>
                  <AssignmentCollaborationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-assignments"
              element={
                <PrivateRoute>
                  <MenteeAssignmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App; 