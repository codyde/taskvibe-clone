import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getUsers, getWorkspaceUsers } from '../server/users';

// Query keys factory
export const userKeys = {
  all: ['users'] as const,
  current: () => [...userKeys.all, 'current'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  workspace: (workspaceId: string) => [...userKeys.lists(), workspaceId] as const,
};

// Get current authenticated user
// Note: Auth is handled server-side in beforeLoad, so we don't need to check session here
export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: () => getCurrentUser(),
  });
}

// Get all users across user's workspaces
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => getUsers(),
  });
}

// Get users in a specific workspace
export function useWorkspaceUsers(workspaceId: string | null) {
  return useQuery({
    queryKey: userKeys.workspace(workspaceId || ''),
    queryFn: () => getWorkspaceUsers({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });
}
