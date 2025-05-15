import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // The token will be automatically included in the cookie
    // due to withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
const publicPaths = ['/', '/terms', '/mentor-agreement', '/forum', '/forum/ask']; // Add all public routes here

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // Check for dynamic forum thread pages
      const isForumThread = currentPath.startsWith('/forum/') && currentPath.split('/').length === 3;
      const isPublic = publicPaths.includes(currentPath) || isForumThread;
      if (!isPublic && currentPath !== '/login') {
        // Only redirect to login for protected pages
        window.location.href = '/login';
        // Optionally show a toast
        if (window?.toast) {
          window.toast('Session expired, please log in again.', { type: 'error' });
        } else if (window.ReactToastify) {
          window.ReactToastify.toast('Session expired, please log in again.', { type: 'error' });
        } else {
          alert('Session expired, please log in again.');
        }
      }
      // Do nothing for public pages
    }
    return Promise.reject(error);
  }
);

// Create a server-side API client
export const createServerApi = (): AxiosInstance => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
  });
};

export default api; 