import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkspaceWebhook,
  saveWorkspaceWebhook,
  deleteWorkspaceWebhook,
  testWorkspaceWebhook,
} from '../server/webhooks';
import type { WebhookEvent } from '../db/schema';

// Query keys factory
export const webhookKeys = {
  all: ['webhooks'] as const,
  workspace: (workspaceId: string) => [...webhookKeys.all, 'workspace', workspaceId] as const,
};

// Webhook type for the hook
export type WebhookConfig = {
  id: string;
  workspaceId: string;
  url: string;
  secret: string | null;
  enabled: boolean;
  events: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Fetch webhook config for a workspace
export function useWorkspaceWebhook(workspaceId: string | null) {
  return useQuery({
    queryKey: webhookKeys.workspace(workspaceId || ''),
    queryFn: () => getWorkspaceWebhook({ data: { workspaceId: workspaceId! } }),
    enabled: !!workspaceId,
  });
}

// Save webhook mutation (create or update)
export function useSaveWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      workspaceId: string;
      url: string;
      secret?: string;
      enabled: boolean;
      events: WebhookEvent[];
    }) => saveWorkspaceWebhook({ data }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.workspace(variables.workspaceId) });
    },
  });
}

// Delete webhook mutation
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) => deleteWorkspaceWebhook({ data: { workspaceId } }),
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: webhookKeys.workspace(workspaceId) });
    },
  });
}

// Test webhook mutation
export function useTestWebhook() {
  return useMutation({
    mutationFn: (workspaceId: string) => testWorkspaceWebhook({ data: { workspaceId } }),
  });
}
