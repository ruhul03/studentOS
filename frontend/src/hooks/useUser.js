import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../api';

export const useUser = (activeUserId, currentUser, isOwnProfile) => {
  return useQuery({
    queryKey: ['user', activeUserId || currentUser?.id],
    queryFn: async () => {
      // If viewing own profile and we don't want to fetch fresh data,
      // we could just return currentUser. But for consistency, fetching fresh is often better.
      // However, to match the original behavior, we can just return currentUser if isOwnProfile.
      if (isOwnProfile) {
        return currentUser;
      }
      
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/users/${activeUserId}`);
      if (!res.ok) {
        throw new Error('User not found');
      }
      return res.json();
    },
    enabled: !!activeUserId || !!currentUser,
  });
};
