import api from '../../lib/api';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getProfileById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const sendConnectionRequest = async (userId) => {
  const response = await api.post(`/users/${userId}/connect`);
  return response.data;
};

export const cancelConnectionRequest = async (userId) => {
  const response = await api.delete(`/users/${userId}/request`);
  return response.data;
};

export const getMyConnectionRequests = async () => {
  const response = await api.get('/users/me/connection-requests');
  return response.data;
};

export const getConnectionStatus = async (userId) => {
  const response = await api.get(`/users/${userId}/connection-status`);
  return response.data;
}; 