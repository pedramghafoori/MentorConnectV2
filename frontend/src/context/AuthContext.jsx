import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { getProfile } from '../features/profile/getProfile';
import { initializeSocket } from '../services/socket';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFullUserProfile = async () => {
    try {
      const profileData = await getProfile();
      console.log('Fetched full profile in AuthContext:', profileData);
      setUser(profileData);
    } catch (error) {
      console.error('Error fetching full profile:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        // After basic auth check, fetch full profile
        setUser(response.data);
        await fetchFullUserProfile();
        // Initialize socket if user is authenticated
        if (response.data?._id) {
          initializeSocket(response.data._id);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      setUser(response.data.user);
      // After registration, fetch full profile
      await fetchFullUserProfile();
      // Initialize socket after registration
      if (response.data.user?._id) {
        initializeSocket(response.data.user._id);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials, onSuccess) => {
    try {
      const response = await api.post('/auth/login', credentials);
      setUser(response.data.user);
      // After login, fetch full profile
      await fetchFullUserProfile();
      // Initialize socket after login
      if (response.data.user?._id) {
        initializeSocket(response.data.user._id);
      }
      if (onSuccess) onSuccess();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 