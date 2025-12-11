import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/lib/auth-middleware';
import { sendWebhook, computeChanges } from '../lib/webhooks';

// Validation schemas
const createProjectSchema = z.object({
  workspaceId: z.string(),
  name: z.string().min(1).max(255),
  color: z.string().optional(),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1).max(255).optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  key: z.string().min(1).max(10).optional(),
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
    where: (wm: any, { and, eq }: any) =>
      and(eq(wm.userId, userId), eq(wm.workspaceId, workspaceId)),
  });
  return !!membership;
}

// Get all projects for user's workspaces
export const getProjects = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data?: { workspaceId?: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { projects } = await import('../db/schema');
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

    return db.query.projects.findMany({
      where: inArray(projects.workspaceId, targetWorkspaces),
      with: {
        lead: true,
      },
      orderBy: (projects: any, { asc }: any) => [asc(projects.name)],
    });
  });

// Get single project
export const getProject = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: { projectId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { projects } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
      with: {
        lead: true,
        workspace: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Verify workspace access
    const hasAccess = await checkWorkspaceAccess(context.user.id, project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return project;
  });

// Create project
export const createProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof createProjectSchema>) => createProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { projects } = await import('../db/schema');

    // Verify workspace access
    const hasAccess = await checkWorkspaceAccess(context.user.id, data.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Generate key from name
    const key =
      data.name
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 3) || 'PRJ';

    const [project] = await db
      .insert(projects)
      .values({
        workspaceId: data.workspaceId,
        name: data.name,
        key,
        color: data.color || '#9D58BF',
        description: data.description,
      })
      .returning();

    // Dispatch webhook (fire-and-forget)
    sendWebhook(data.workspaceId, 'project.created', {
      action: 'created',
      resource: project,
    });

    return project;
  });

// Update project
export const updateProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof updateProjectSchema>) => updateProjectSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { projects } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get project to verify access
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Store old values for webhook change tracking
    const oldProject = { ...project };

    const { projectId, ...updates } = data;
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();

    // Compute changes for webhook
    const changes = computeChanges(oldProject, updated, ['name', 'color', 'description', 'key']);

    // Dispatch webhook (fire-and-forget)
    sendWebhook(project.workspaceId, 'project.updated', {
      action: 'updated',
      resource: updated,
      changes,
    });

    return updated;
  });

// Delete project
export const deleteProject = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { projectId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { projects } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get project to verify access
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, data.projectId),
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Store project data for webhook before deletion
    const deletedProjectData = { ...project };
    const workspaceId = project.workspaceId;

    // Delete project (cascade will delete issues)
    await db.delete(projects).where(eq(projects.id, data.projectId));

    // Dispatch webhook (fire-and-forget)
    sendWebhook(workspaceId, 'project.deleted', {
      action: 'deleted',
      resource: deletedProjectData,
    });

    return { success: true };
  });
