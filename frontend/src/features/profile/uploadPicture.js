import axios from 'axios';

export const uploadPicture = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true
  });

  return response.data.url;
}; 