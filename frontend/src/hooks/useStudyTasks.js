import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../api';
import { playToggleSound, playDeleteSound } from '../utils/notificationSound';

const API = import.meta.env.VITE_API_URL;

export function useStudyTasks(userId) {
  const queryClient = useQueryClient();

  // Fetch Tasks
  const { 
    data: tasks = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['studyTasks', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetchWithAuth(`${API}/api/planner/user/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Toggle Task Status Mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetchWithAuth(`${API}/api/planner/${id}/toggle`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to toggle task');
      return response.json();
    },
    onMutate: async (id) => {
      playToggleSound();
      // Optimistic update
      await queryClient.cancelQueries(['studyTasks', userId]);
      const previousTasks = queryClient.getQueryData(['studyTasks', userId]);
      queryClient.setQueryData(['studyTasks', userId], old => 
        old?.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
      );
      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['studyTasks', userId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['studyTasks', userId]);
    }
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetchWithAuth(`${API}/api/planner/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
    },
    onMutate: async (id) => {
      playDeleteSound();
      // Optimistic update
      await queryClient.cancelQueries(['studyTasks', userId]);
      const previousTasks = queryClient.getQueryData(['studyTasks', userId]);
      queryClient.setQueryData(['studyTasks', userId], old => old?.filter(t => t.id !== id));
      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['studyTasks', userId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['studyTasks', userId]);
    }
  });

  return {
    tasks,
    isLoading,
    error,
    toggleTask: toggleTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    refetch: () => queryClient.invalidateQueries(['studyTasks', userId])
  };
}
