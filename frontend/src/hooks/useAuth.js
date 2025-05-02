import useUserStore from '../stores/userStore';
import * as api from '../services/api';

const useAuth = () => {
  const { user, setUser } = useUserStore();

  const register = async (userData) => {
    try {
      const { message } = await api.register(userData);
      return { message };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to register');
    }
  };

  const login = async (credentials) => {
    try {
      const { user: newUser } = await api.login(credentials);
      setUser(newUser);
      return { user: newUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to login');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Unable to logout');
    }
  };

  return {
    user,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth; 