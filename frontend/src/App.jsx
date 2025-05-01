import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import HomePage from './pages/Home/HomePage';
import Navbar from './components/Navbar';
import SettingsPage from './pages/Settings/SettingsPage';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Optionally show a spinner here

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/dashboard/*" element={user ? <DashboardRouter /> : <Navigate to="/" />} />
            <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App; 