import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import HomePage from './pages/Home/HomePage';
import Navbar from './components/Navbar';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import Footer from './components/Footer';
import TermsPage from './pages/Legal/TermsPage';
import MentorAgreementPage from './pages/Legal/MentorAgreementPage';
import MyCourses from './pages/Dashboard/mentor/MyCourses';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Optionally show a spinner here

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/dashboard/*" element={user ? <DashboardRouter /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/mentor-agreement" element={<MentorAgreementPage />} />
            <Route path="/courses/my-courses" element={user ? <MyCourses /> : <Navigate to="/" />} />
            <Route path="/courses/edit/:courseId" element={user ? <MyCourses /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App; 