import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/lib/auth-middleware';

// Validation schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).optional(),
});

// Get user's workspaces
export const getWorkspaces = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { db } = await import('../db');
    const { workspaceMembers } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const memberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, context.user.id),
      with: {
        workspace: true,
      },
    });

    return memberships.map((m: any) => ({
      ...m.workspace,
      role: m.role,
    }));
  });

// Get single workspace
export const getWorkspace = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');

    const membership = await db.query.workspaceMembers.findFirst({
      where: (wm: any, { and, eq }: any) =>
        and(eq(wm.userId, context.user.id), eq(wm.workspaceId, data.workspaceId)),
      with: {
        workspace: true,
      },
    });

    if (!membership) {
      throw new Error('Workspace not found');
    }

    return {
      ...membership.workspace,
      role: membership.role,
    };
  });

// Create workspace
export const createWorkspace = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof createWorkspaceSchema>) => createWorkspaceSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { workspaces, workspaceMembers, labels, projects } = await import('../db/schema');

    // Generate slug from name if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Create workspace in transaction
    const result = await db.transaction(async (tx) => {
      // Create workspace
      const [workspace] = await tx
        .insert(workspaces)
        .values({
          name: data.name,
          slug,
          ownerId: context.user.id,
        })
        .returning();

      // Add owner as member
      await tx.insert(workspaceMembers).values({
        workspaceId: workspace.id,
        userId: context.user.id,
        role: 'owner',
      });

      // Create default labels
      await tx.insert(labels).values([
        { workspaceId: workspace.id, name: 'Bug', color: '#FF708C' },
        { workspaceId: workspace.id, name: 'Feature', color: '#9D58BF' },
        { workspaceId: workspace.id, name: 'Improvement', color: '#FF9838' },
      ]);

      // Create default project
      await tx.insert(projects).values({
        workspaceId: workspace.id,
        name: 'My Project',
        key: 'PRJ',
        color: '#9D58BF',
        description: 'Your first project',
      });

      return workspace;
    });

    return result;
  });

// Update workspace
export const updateWorkspace = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string; name?: string; icon?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { workspaces } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Check access (must be owner or admin)
    const membership = await db.query.workspaceMembers.findFirst({
      where: (wm: any, { and, eq }: any) =>
        and(eq(wm.userId, context.user.id), eq(wm.workspaceId, data.workspaceId)),
    });

    if (!membership || membership.role === 'member') {
      throw new Error('Unauthorized');
    }

    const { workspaceId, ...updates } = data;
    const [updated] = await db
      .update(workspaces)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return updated;
  });
