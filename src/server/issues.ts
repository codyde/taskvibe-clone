import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { authMiddleware } from '@/lib/auth-middleware';
import { sendWebhook, computeChanges } from '../lib/webhooks';

// Validation schemas
const issueStatusEnum = z.enum([
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
]);

const issuePriorityEnum = z.enum(['urgent', 'high', 'medium', 'low', 'none']);

const createIssueSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: issueStatusEnum.default('backlog'),
  priority: issuePriorityEnum.default('none'),
  projectId: z.string(),
  assigneeId: z.string().optional(),
  labels: z.array(z.string()).optional(),
  estimate: z.number().optional(),
  dueDate: z.string().optional(),
  parentId: z.string().optional(),
});

const updateIssueSchema = z.object({
  issueId: z.string(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: issueStatusEnum.optional(),
  priority: issuePriorityEnum.optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  estimate: z.number().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

const getIssuesSchema = z.object({
  workspaceId: z.string().optional(),
  projectId: z.string().optional(),
  status: z.array(issueStatusEnum).optional(),
  priority: z.array(issuePriorityEnum).optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
}).optional();

type GetIssuesFilters = z.infer<typeof getIssuesSchema>;

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

// Get issues with filters
export const getIssues = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data?: GetIssuesFilters) => data)
  .handler(async ({ data: filters, context }) => {
    const { db } = await import('../db');
    const { issues, projects } = await import('../db/schema');
    type IssueStatus = (typeof issues)['status']['enumValues'][number];
    type IssuePriority = (typeof issues)['priority']['enumValues'][number];
    const { eq, and, inArray, ilike, or, desc } = await import('drizzle-orm');

    const workspaceIds = await getUserWorkspaceIds(context.user.id);

    if (workspaceIds.length === 0) {
      return [];
    }

    // Get projects in user's workspaces
    const userProjects = await db.query.projects.findMany({
      where: inArray(projects.workspaceId, workspaceIds),
      columns: { id: true },
    });
    const projectIds = userProjects.map((p: any) => p.id);

    if (projectIds.length === 0) {
      return [];
    }

    // Build conditions array
    const conditions = [inArray(issues.projectId, projectIds)];

    // Apply filters
    if (filters?.projectId && projectIds.includes(filters.projectId)) {
      conditions.push(eq(issues.projectId, filters.projectId));
    }

    if (filters?.status?.length) {
      conditions.push(inArray(issues.status, filters.status as IssueStatus[]));
    }

    if (filters?.priority?.length) {
      conditions.push(inArray(issues.priority, filters.priority as IssuePriority[]));
    }

    if (filters?.assigneeId) {
      conditions.push(eq(issues.assigneeId, filters.assigneeId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(issues.title, `%${filters.search}%`),
          ilike(issues.identifier, `%${filters.search}%`),
          ilike(issues.description, `%${filters.search}%`)
        )!
      );
    }

    const result = await db.query.issues.findMany({
      where: and(...conditions),
      with: {
        project: true,
        assignee: true,
        creator: true,
        issueLabels: {
          with: {
            label: true,
          },
        },
      },
      orderBy: [desc(issues.createdAt)],
    });

    // Transform to include labels array
    return result.map((issue: any) => ({
      ...issue,
      labels: issue.issueLabels.map((il: any) => il.label),
    }));
  });

// Get single issue
export const getIssue = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: { issueId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { issues } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, data.issueId),
      with: {
        project: {
          with: {
            workspace: true,
          },
        },
        assignee: true,
        creator: true,
        issueLabels: {
          with: {
            label: true,
          },
        },
        subIssues: true,
      },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    // Verify workspace access
    const hasAccess = await checkWorkspaceAccess(context.user.id, issue.project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return {
      ...issue,
      labels: issue.issueLabels.map((il: any) => il.label),
    };
  });

// Create issue
export const createIssue = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof createIssueSchema>) => createIssueSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { issues, issueLabels, projects } = await import('../db/schema');
    const { eq, sql } = await import('drizzle-orm');

    // Get project to verify access and get workspace
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

    // Create issue in transaction
    const result = await db.transaction(async (tx) => {
      // Increment project counter and get new number
      const [updatedProject] = await tx
        .update(projects)
        .set({ issueCounter: sql`${projects.issueCounter} + 1` })
        .where(eq(projects.id, data.projectId))
        .returning();

      const identifier = `${project.key}-${updatedProject.issueCounter}`;

      // Create issue
      const [newIssue] = await tx
        .insert(issues)
        .values({
          identifier,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          projectId: data.projectId,
          assigneeId: data.assigneeId,
          creatorId: context.user.id,
          parentId: data.parentId,
          estimate: data.estimate,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        })
        .returning();

      // Add labels if provided
      if (data.labels?.length) {
        await tx.insert(issueLabels).values(
          data.labels.map((labelId: string) => ({
            issueId: newIssue.id,
            labelId,
          }))
        );
      }

      return newIssue;
    });

    // Dispatch webhook (fire-and-forget)
    sendWebhook(project.workspaceId, 'issue.created', {
      action: 'created',
      resource: result,
    });

    return result;
  });

// Update issue
export const updateIssue = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: z.infer<typeof updateIssueSchema>) => updateIssueSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { issues, issueLabels } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get issue to verify access
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, data.issueId),
      with: {
        project: true,
      },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, issue.project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Store old values for webhook change tracking
    const oldIssue = { ...issue };

    const { issueId, labels: labelIds, ...updates } = data;

    // Update in transaction if labels need updating
    const result = await db.transaction(async (tx) => {
      // Update issue fields
      const updateData: Record<string, unknown> = {
        ...updates,
        updatedAt: new Date(),
      };

      // Handle nullable fields
      if (updates.assigneeId === null) {
        updateData.assigneeId = null;
      }
      if (updates.dueDate === null) {
        updateData.dueDate = null;
      } else if (updates.dueDate) {
        updateData.dueDate = new Date(updates.dueDate);
      }

      const [updated] = await tx
        .update(issues)
        .set(updateData)
        .where(eq(issues.id, issueId))
        .returning();

      // Update labels if provided
      if (labelIds !== undefined) {
        // Remove existing labels
        await tx.delete(issueLabels).where(eq(issueLabels.issueId, issueId));

        // Add new labels
        if (labelIds.length > 0) {
          await tx.insert(issueLabels).values(
            labelIds.map((labelId: string) => ({
              issueId,
              labelId,
            }))
          );
        }
      }

      return updated;
    });

    // Compute changes for webhook
    const changes = computeChanges(oldIssue, result, [
      'title',
      'description',
      'status',
      'priority',
      'assigneeId',
      'estimate',
      'dueDate',
    ]);

    // Dispatch webhook (fire-and-forget)
    sendWebhook(issue.project.workspaceId, 'issue.updated', {
      action: 'updated',
      resource: result,
      changes,
    });

    return result;
  });

// Delete issue
export const deleteIssue = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((data: { issueId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { issues } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    // Get issue to verify access
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, data.issueId),
      with: {
        project: true,
      },
    });

    if (!issue) {
      throw new Error('Issue not found');
    }

    const hasAccess = await checkWorkspaceAccess(context.user.id, issue.project.workspaceId);
    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    // Store issue data for webhook before deletion
    const deletedIssueData = { ...issue, project: undefined };
    const workspaceId = issue.project.workspaceId;

    // Delete issue (cascade will delete issue_labels)
    await db.delete(issues).where(eq(issues.id, data.issueId));

    // Dispatch webhook (fire-and-forget)
    sendWebhook(workspaceId, 'issue.deleted', {
      action: 'deleted',
      resource: deletedIssueData,
    });

    return { success: true };
  });
