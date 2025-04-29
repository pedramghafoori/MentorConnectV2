import axios from 'axios';

export const updateProfile = async (profileData) => {
  const response = await axios.patch('/api/users/me', profileData, {
    withCredentials: true
  });
  return response.data;
}; 