import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export function useProfileMutations() {
  const queryClient = useQueryClient();
  const { user, updateUserData, logout } = useAuth();
  const navigate = useNavigate();

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(user?.token ? { 'Authorization': `Bearer ${user.token}` } : {}),
      ...options.headers
    };
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Request failed');
    }
    return response;
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await fetchWithAuth(`${API}/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Preserve token if the backend didn't return a new one
      const userToStore = { ...updatedUser, token: user.token };
      updateUserData(userToStore);
      queryClient.invalidateQueries(['user', user.id]);
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async () => {
      await fetchWithAuth(`${API}/api/users/${user.id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      logout();
      navigate('/');
    }
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    deleteProfile: deleteProfileMutation.mutateAsync,
    isDeleting: deleteProfileMutation.isPending
  };
}
