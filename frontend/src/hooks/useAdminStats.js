import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../api';

export const useAdminStats = (user) => {
  return useQuery({
    queryKey: ['adminData'],
    queryFn: async () => {
      const endpoints = [
        { key: 'stats', url: '/api/admin/stats' },
        { key: 'health', url: '/api/admin/health' },
        { key: 'users', url: '/api/admin/users' },
        { key: 'resources', url: '/api/admin/resources' },
        { key: 'marketItems', url: '/api/admin/marketplace' },
        { key: 'events', url: '/api/admin/events' },
        { key: 'services', url: '/api/services' },
        { key: 'growth', url: '/api/admin/analytics/growth' },
        { key: 'departments', url: '/api/admin/analytics/departments' },
        { key: 'contributors', url: '/api/admin/analytics/contributors' }
      ];

      const results = await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}${url}`);
            if (res.ok) {
              const data = await res.json();
              return { key, data };
            }
          } catch (err) {
            console.error(`Failed to fetch from ${url}`, err);
          }
          return { key, data: null };
        })
      );

      const dataMap = results.reduce((acc, curr) => {
        acc[curr.key] = curr.data;
        return acc;
      }, {});

      // If stats is missing, we consider it a failure for the main dashboard load
      if (!dataMap.stats && !dataMap.users) {
        throw new Error('Critical system synchronization failure');
      }

      return dataMap;
    },
    enabled: !!user && user.role === 'ADMIN',
  });
};
