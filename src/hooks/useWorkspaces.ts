import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
} from '../server/workspaces';

// Query keys factory
export const workspaceKeys = {
  all: ['workspaces'] as const,
  lists: () => [...workspaceKeys.all, 'list'] as const,
  details: () => [...workspaceKeys.all, 'detail'] as const,
  detail: (id: string) => [...workspaceKeys.details(), id] as const,
};

// Workspace type for optimistic updates
type WorkspaceListItem = {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
};

// Fetch user's workspaces
// Note: Auth is handled server-side in beforeLoad, so we don't need to check session here
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.lists(),
    queryFn: async () => {
      console.log('[useWorkspaces] Fetching workspaces...');
      try {
        const result = await getWorkspaces();
        console.log('[useWorkspaces] Got workspaces:', result);
        return result;
      } catch (error) {
        console.error('[useWorkspaces] Error fetching workspaces:', error);
        throw error;
      }
    },
    retry: false, // Don't retry on error so we can see what's happening
  });
}

// Fetch single workspace
export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: workspaceKeys.detail(workspaceId || ''),
    queryFn: () => getWorkspace({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });
}

// Create workspace mutation
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; slug?: string }) => createWorkspace({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
      // Also invalidate projects and labels since new workspace creates defaults
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['labels'] });
    },
  });
}

// Update workspace mutation
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { workspaceId: string; name?: string; icon?: string | null }) =>
      updateWorkspace({ data }),
    onMutate: async ({ workspaceId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: workspaceKeys.detail(workspaceId) });

      const previousWorkspace = queryClient.getQueryData(workspaceKeys.detail(workspaceId));

      queryClient.setQueryData(workspaceKeys.detail(workspaceId), (old: unknown) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      queryClient.setQueryData<WorkspaceListItem[]>(workspaceKeys.lists(), (old) => {
        if (!old) return old;
        return old.map((ws) =>
          ws.id === workspaceId ? { ...ws, ...updates } : ws
        );
      });

      return { previousWorkspace };
    },
    onError: (_err, { workspaceId }, context) => {
      if (context?.previousWorkspace) {
        queryClient.setQueryData(workspaceKeys.detail(workspaceId), context.previousWorkspace);
      }
    },
    onSettled: (_data, _error, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
    },
  });
}
