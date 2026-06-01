import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../api';
import { playDeleteSound, playSuccessSound, playErrorSound } from '../utils/notificationSound';

const API = `${import.meta.env.VITE_API_URL}/api/marketplace`;

export function useMarketplace(activeCategory) {
  const queryClient = useQueryClient();

  // Fetch Items
  const { 
    data: items = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['marketplaceItems', activeCategory],
    queryFn: async () => {
      const url = activeCategory === 'All' ? API : `${API}?category=${activeCategory}`;
      const response = await fetchWithAuth(url);
      if (!response.ok) throw new Error('Failed to fetch marketplace items');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Create or Update Listing Mutation
  const saveListingMutation = useMutation({
    mutationFn: async ({ payload, isEdit, itemId }) => {
      const url = isEdit ? `${API}/${itemId}` : API;
      const response = await fetchWithAuth(url, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save listing');
      return response.json();
    },
    onSuccess: () => {
      playSuccessSound();
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
    },
    onError: (err) => {
      playErrorSound();
      console.error('Save failed', err);
    }
  });

  // Delete Listing Mutation
  const deleteListingMutation = useMutation({
    mutationFn: async ({ id, userId }) => {
      const response = await fetchWithAuth(`${API}/${id}?userId=${userId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete listing');
    },
    onSuccess: () => {
      playDeleteSound();
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
    },
    onError: (err) => {
      playErrorSound();
      console.error('Delete failed', err);
    }
  });

  // Mark as Sold Mutation
  const markAsSoldMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetchWithAuth(`${API}/${id}/sold`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to mark as sold');
    },
    onSuccess: () => {
      playSuccessSound();
      queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] });
    },
    onError: (err) => {
      playErrorSound();
      console.error('Failed to mark as sold', err);
    }
  });

  return {
    items,
    isLoading,
    error,
    saveListing: saveListingMutation.mutateAsync,
    deleteListing: deleteListingMutation.mutate,
    markAsSold: markAsSoldMutation.mutate,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['marketplaceItems'] })
  };
}
