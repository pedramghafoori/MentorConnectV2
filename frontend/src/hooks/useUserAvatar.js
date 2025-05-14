import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useUserAvatar(userId) {
  return useQuery({
    queryKey: ['user-avatar', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await api.get(`/users/${userId}`);
      return data.avatarUrl || data.profilePicture || '/default-avatar.png';
    },
    enabled: !!userId,
  });
} 