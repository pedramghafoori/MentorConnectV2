import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './stores/userStore';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DashboardRouter from './pages/Dashboard/DashboardRouter';

const App = () => {
  const { token } = useUserStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/dashboard" />} />
        <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/dashboard/*" element={token ? <DashboardRouter /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App; 