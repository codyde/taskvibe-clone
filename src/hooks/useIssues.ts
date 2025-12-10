import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue,
} from '../server/issues';
import type { IssueStatus, IssuePriority } from '../db/schema';

// Query keys factory
export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...issueKeys.lists(), filters] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: string) => [...issueKeys.details(), id] as const,
};

// Filter type
export type IssueFilters = {
  workspaceId?: string;
  projectId?: string;
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string;
  search?: string;
};

// Issue type for optimistic updates
type IssueListItem = {
  id: string;
  identifier: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  assigneeId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Fetch issues
// Note: Auth is handled server-side in beforeLoad, so we don't need to check session here
export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: issueKeys.list(filters ?? {}),
    queryFn: () => getIssues({ data: filters }),
  });
}

// Fetch single issue
export function useIssue(issueId: string | null) {
  return useQuery({
    queryKey: issueKeys.detail(issueId || ''),
    queryFn: () => getIssue({ data: { issueId: issueId! } }),
    enabled: !!issueId,
  });
}

// Create issue mutation
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      status: IssueStatus;
      priority: IssuePriority;
      projectId: string;
      assigneeId?: string;
      labels?: string[];
      estimate?: number;
      dueDate?: string;
      parentId?: string;
    }) => createIssue({ data }),
    onMutate: async (newIssue) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: issueKeys.lists() });

      // Snapshot previous value
      const previousIssues = queryClient.getQueryData(issueKeys.lists());

      // Optimistically update
      queryClient.setQueriesData<IssueListItem[]>(
        { queryKey: issueKeys.lists() },
        (old) => {
          if (!old) return old;
          return [
            {
              ...newIssue,
              id: 'temp-' + Date.now(),
              identifier: 'NEW',
              status: newIssue.status || 'backlog',
              priority: newIssue.priority || 'none',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as IssueListItem,
            ...old,
          ];
        }
      );

      return { previousIssues };
    },
    onError: (_err, _newIssue, context) => {
      // Rollback on error
      if (context?.previousIssues) {
        queryClient.setQueriesData({ queryKey: issueKeys.lists() }, context.previousIssues);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

// Update issue mutation
export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      issueId: string;
      title?: string;
      description?: string;
      status?: IssueStatus;
      priority?: IssuePriority;
      assigneeId?: string | null;
      labels?: string[];
      estimate?: number | null;
      dueDate?: string | null;
    }) => updateIssue({ data }),
    onMutate: async ({ issueId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.detail(issueId) });

      const previousIssue = queryClient.getQueryData(issueKeys.detail(issueId));

      // Optimistic update on detail
      queryClient.setQueryData(issueKeys.detail(issueId), (old: unknown) => {
        if (!old) return old;
        return { ...old, ...updates, updatedAt: new Date().toISOString() };
      });

      // Also update in lists
      queryClient.setQueriesData<IssueListItem[]>(
        { queryKey: issueKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.map((issue) =>
            issue.id === issueId
              ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
              : issue
          );
        }
      );

      return { previousIssue };
    },
    onError: (_err, { issueId }, context) => {
      if (context?.previousIssue) {
        queryClient.setQueryData(issueKeys.detail(issueId), context.previousIssue);
      }
    },
    onSettled: (_data, _error, { issueId }) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}

// Delete issue mutation
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => deleteIssue({ data: { issueId } }),
    onMutate: async (issueId) => {
      await queryClient.cancelQueries({ queryKey: issueKeys.lists() });

      const previousIssues = queryClient.getQueryData(issueKeys.lists());

      // Optimistically remove from lists
      queryClient.setQueriesData<IssueListItem[]>(
        { queryKey: issueKeys.lists() },
        (old) => {
          if (!old) return old;
          return old.filter((issue) => issue.id !== issueId);
        }
      );

      return { previousIssues };
    },
    onError: (_err, _issueId, context) => {
      if (context?.previousIssues) {
        queryClient.setQueriesData({ queryKey: issueKeys.lists() }, context.previousIssues);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() });
    },
  });
}
