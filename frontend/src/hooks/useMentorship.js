import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useMentorSearch = (filters) => {
  return useQuery({
    queryKey: ['mentors', filters],
    queryFn: async () => {
      const { data } = await api.get('/mentors/search', { params: filters });
      return data;
    },
  });
};

export const useMentorshipRequests = (type) => {
  return useQuery({
    queryKey: ['requests', type],
    queryFn: async () => {
      const { data } = await api.get(`/mentorship/requests/${type}`);
      return data;
    },
  });
};

export const useRequestMentorship = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData) => {
      const { data } = await api.post('/mentorship/requests', requestData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useRespondToRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, action }) => {
      const { data } = await api.put(`/mentorship/requests/${requestId}/${action}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useMentorshipConnections = () => {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data } = await api.get('/mentorship/connections');
      return data;
    },
  });
}; 