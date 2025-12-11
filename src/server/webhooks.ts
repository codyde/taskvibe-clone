import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '../lib/auth-middleware';
import { WEBHOOK_EVENTS } from '../db/schema';
import { sendTestWebhook } from '../lib/webhooks';

// Validation schemas
const webhookEventSchema = z.enum(WEBHOOK_EVENTS);

const saveWebhookSchema = z.object({
  workspaceId: z.string(),
  url: z.string().url(),
  secret: z.string().optional(),
  enabled: z.boolean().default(true),
  events: z.array(webhookEventSchema).min(1),
});

// Helper to check workspace access (owner or admin only for webhooks)
async function checkWebhookAccess(userId: string, workspaceId: string): Promise<boolean> {
  const { db } = await import('../db');

  const membership = await db.query.workspaceMembers.findFirst({
    where: (wm, { and, eq }) =>
      and(eq(wm.userId, userId), eq(wm.workspaceId, workspaceId)),
  });

  // Only owners and admins can manage webhooks
  return membership?.role === 'owner' || membership?.role === 'admin';
}

// Get webhook config for a workspace
export const getWorkspaceWebhook = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { webhooks } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const hasAccess = await checkWebhookAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized - only owners and admins can view webhook settings');
    }

    const webhook = await db.query.webhooks.findFirst({
      where: eq(webhooks.workspaceId, data.workspaceId),
    });

    return webhook || null;
  });

// Save (create or update) webhook config
export const saveWorkspaceWebhook = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof saveWebhookSchema>) => saveWebhookSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { webhooks } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const hasAccess = await checkWebhookAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized - only owners and admins can manage webhooks');
    }

    // Check if webhook already exists
    const existing = await db.query.webhooks.findFirst({
      where: eq(webhooks.workspaceId, data.workspaceId),
    });

    if (existing) {
      // Update existing webhook
      const [updated] = await db
        .update(webhooks)
        .set({
          url: data.url,
          secret: data.secret || null,
          enabled: data.enabled,
          events: data.events,
          updatedAt: new Date(),
        })
        .where(eq(webhooks.id, existing.id))
        .returning();

      return updated;
    } else {
      // Create new webhook
      const [created] = await db
        .insert(webhooks)
        .values({
          workspaceId: data.workspaceId,
          url: data.url,
          secret: data.secret || null,
          enabled: data.enabled,
          events: data.events,
        })
        .returning();

      return created;
    }
  });

// Delete webhook config
export const deleteWorkspaceWebhook = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { webhooks } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const hasAccess = await checkWebhookAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized - only owners and admins can manage webhooks');
    }

    await db.delete(webhooks).where(eq(webhooks.workspaceId, data.workspaceId));

    return { success: true };
  });

// Test webhook connectivity
export const testWorkspaceWebhook = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async ({ data, context }) => {
    const hasAccess = await checkWebhookAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized - only owners and admins can test webhooks');
    }

    const result = await sendTestWebhook(data.workspaceId);
    return result;
  });
