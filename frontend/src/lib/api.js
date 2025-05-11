import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    // The token will be automatically included in the cookie
    // due to withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      } else {
        // Show a session expired message if already on login page
        if (window?.toast) {
          window.toast('Session expired, please log in again.', { type: 'error' });
        } else if (window.ReactToastify) {
          window.ReactToastify.toast('Session expired, please log in again.', { type: 'error' });
        } else {
          alert('Session expired, please log in again.');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Create a server-side API client
export const createServerApi = () => {
  return axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
  });
};

export default api; 