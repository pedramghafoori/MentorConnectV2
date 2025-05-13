import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProfilePage from './pages/Profile/ProfilePage';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import HomePage from './pages/Home/HomePage';
import Navbar from './components/Navbar';
import SettingsPage from './pages/Settings/SettingsPage.jsx';
import Footer from './components/Footer';
import TermsPage from './pages/Legal/TermsPage';
import MentorAgreementPage from './pages/Legal/MentorAgreementPage';
import MyCourses from './pages/Dashboard/mentor/MyCourses';
import TestPager1 from './pages/TestPager1.jsx';
import ForumHome from './pages/forum/ForumHome';
import ThreadPage from './pages/forum/ThreadPage';
import AskQuestionPage from './pages/forum/AskQuestionPage';
import { MentorAssignmentsPage } from './pages/MentorAssignmentsPage';
import { MenteeAssignmentsPage } from './pages/MenteeAssignmentsPage';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Optionally show a spinner here

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/testpager1" element={<TestPager1 />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/mentor-agreement" element={<MentorAgreementPage />} />
            <Route path="/courses/my-courses" element={user ? <MyCourses /> : <Navigate to="/" />} />
            <Route path="/courses/edit/:courseId" element={user ? <MyCourses /> : <Navigate to="/" />} />
            
            {/* Mentor Routes */}
            <Route path="/mentor/assignments" element={user ? <MentorAssignmentsPage /> : <Navigate to="/" />} />
            
            {/* Mentee Routes */}
            <Route path="/mentee/assignments" element={user ? <MenteeAssignmentsPage /> : <Navigate to="/" />} />
            
            {/* Forum Routes */}
            <Route path="/forum" element={<ForumHome />} />
            <Route path="/forum/ask" element={user ? <AskQuestionPage /> : <Navigate to="/" />} />
            <Route path="/forum/:slug" element={<ThreadPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App; 