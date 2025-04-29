import api from '../../lib/api';

export const uploadPicture = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.url;
}; 