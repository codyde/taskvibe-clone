import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../server/projects';

// Query keys factory
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Project type for optimistic updates
type ProjectListItem = {
  id: string;
  name: string;
  key: string;
  color: string;
  workspaceId: string;
};

// Fetch projects
// Note: Auth is handled server-side in beforeLoad, so we don't need to check session here
export function useProjects(workspaceId?: string) {
  return useQuery({
    queryKey: projectKeys.list({ workspaceId }),
    queryFn: () => getProjects({ data: workspaceId ? { workspaceId } : undefined }),
  });
}

// Fetch single project
export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(projectId || ''),
    queryFn: () => getProject({ data: { projectId: projectId! } }),
    enabled: !!projectId,
  });
}

// Create project mutation
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      workspaceId: string;
      name: string;
      color?: string;
      description?: string;
    }) => createProject({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      projectId: string;
      name?: string;
      color?: string;
      description?: string;
      key?: string;
    }) => updateProject({ data }),
    onMutate: async ({ projectId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(projectId) });

      const previousProject = queryClient.getQueryData(projectKeys.detail(projectId));

      queryClient.setQueryData(projectKeys.detail(projectId), (old: unknown) => {
        if (!old) return old;
        return { ...old, ...updates };
      });

      queryClient.setQueriesData<ProjectListItem[]>(
        { queryKey: projectKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((project) =>
            project.id === projectId ? { ...project, ...updates } : project
          );
        }
      );

      return { previousProject };
    },
    onError: (_err, { projectId }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(projectId), context.previousProject);
      }
    },
    onSettled: (_data, _error, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject({ data: { projectId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Also invalidate issues since they're tied to projects
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}
