import useUserStore from '../stores/userStore';

const useAuth = () => {
  const { token, user, setToken, setUser } = useUserStore();

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return {
    user,
    token,
    logout,
    isAuthenticated: !!token,
  };
};

export default useAuth; 