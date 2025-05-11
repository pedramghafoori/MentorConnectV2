import api from '../../lib/api';

export const uploadPicture = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/users/me/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
}; 