import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './stores/userStore';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardRouter from './pages/Dashboard/DashboardRouter';
import HomePage from './pages/Home/HomePage';
import Navbar from './components/Navbar';

const App = () => {
  const { token } = useUserStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/dashboard/*" element={token ? <DashboardRouter /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App; 