import useUserStore from '../stores/userStore';
import * as api from '../services/api';

const useAuth = () => {
  const { token, user, setToken, setUser } = useUserStore();

  const register = async (userData) => {
    try {
      const { accessToken, refreshToken, message } = await api.register(userData);
      setToken(accessToken);
      // Optionally, fetch user profile here if needed
      return { accessToken, refreshToken, message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to register');
    }
  };

  const login = async (credentials) => {
    try {
      const { token: newToken, user: newUser } = await api.login(credentials);
      setToken(newToken);
      setUser(newUser);
      return { token: newToken, user: newUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to login');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  };
};

export default useAuth; 