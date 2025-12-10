import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../server/labels';

// Query keys factory
export const labelKeys = {
  all: ['labels'] as const,
  lists: () => [...labelKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...labelKeys.lists(), filters] as const,
};

// Fetch labels
// Note: Auth is handled server-side in beforeLoad, so we don't need to check session here
export function useLabels(workspaceId?: string) {
  return useQuery({
    queryKey: labelKeys.list({ workspaceId }),
    queryFn: () => getLabels({ data: workspaceId ? { workspaceId } : undefined }),
  });
}

// Create label mutation
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof createLabel>[0]['data']) =>
      createLabel({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}

// Update label mutation
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateLabel>[0]['data']) =>
      updateLabel({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}

// Delete label mutation
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) => deleteLabel({ data: { labelId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelKeys.lists() });
    },
  });
}
