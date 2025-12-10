import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '../lib/auth-middleware';

// Validation schemas
const createLabelSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const updateLabelSchema = z.object({
  labelId: z.string(),
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// Helper to get workspace IDs for a user
async function getUserWorkspaceIds(userId: string): Promise<string[]> {
  const { db } = await import('../db');
  const { workspaceMembers } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');

  const memberships = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId));
  return memberships.map((m) => m.workspaceId);
}

// Helper to check workspace access
async function checkWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
  const { db } = await import('../db');

  const membership = await db.query.workspaceMembers.findFirst({
    where: (wm, { and, eq }) =>
      and(eq(wm.userId, userId), eq(wm.workspaceId, workspaceId)),
  });
  return !!membership;
}

// Get labels for user's workspaces
export const getLabels = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data?: { workspaceId?: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { labels } = await import('../db/schema');
    const { inArray } = await import('drizzle-orm');

    const workspaceIds = await getUserWorkspaceIds(context.user.id);

    if (workspaceIds.length === 0) {
      return [];
    }

    // Filter by specific workspace if provided
    const targetWorkspaces = data?.workspaceId
      ? [data.workspaceId].filter((id) => workspaceIds.includes(id))
      : workspaceIds;

    if (targetWorkspaces.length === 0) {
      return [];
    }

    return db.query.labels.findMany({
      where: inArray(labels.workspaceId, targetWorkspaces),
      orderBy: (labels, { asc }) => [asc(labels.name)],
    });
  });

// Create label
export const createLabel = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof createLabelSchema>) => createLabelSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { labels } = await import('../db/schema');

    const hasAccess = await checkWorkspaceAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    const [label] = await db
      .insert(labels)
      .values({
        workspaceId: data.workspaceId,
        name: data.name,
        color: data.color,
      })
      .returning();

    return label;
  });

// Update label
export const updateLabel = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof updateLabelSchema>) => updateLabelSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { labels } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get label to verify access
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, data.labelId),
    });

    if (!label) {
      throw new Error('Label not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, label.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    const { labelId, ...updates } = data;
    const [updated] = await db
      .update(labels)
      .set(updates)
      .where(eq(labels.id, labelId))
      .returning();

    return updated;
  });

// Delete label
export const deleteLabel = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { labelId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { labels } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get label to verify access
    const label = await db.query.labels.findFirst({
      where: eq(labels.id, data.labelId),
    });

    if (!label) {
      throw new Error('Label not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, label.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Delete label (cascade will remove from issue_labels)
    await db.delete(labels).where(eq(labels.id, data.labelId));

    return { success: true };
  });
