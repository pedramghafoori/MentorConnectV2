import api from '../../lib/api';

export const updateProfile = async (profileData) => {
  const response = await api.patch('/users/me', profileData);
  return response.data;
}; 