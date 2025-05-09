import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Create a server-side API client
export const createServerApi = () => {
  return axios.create({
    baseURL: process.env.VITE_API_URL || 'http://localhost:4000/api',
    withCredentials: true,
  });
};

export default api; 