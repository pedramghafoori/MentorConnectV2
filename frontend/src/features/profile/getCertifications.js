import api from '../../lib/api';

export const getCertifications = async (lssId) => {
  const response = await api.post('/lss/certifications', { lssId });
  return response.data;
}; 