import { createServerFn } from '@tanstack/react-start';
import { authMiddleware } from '../lib/auth-middleware';

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

// Get current user
export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.user;
  });

// Get users in workspace (for assignee selection)
export const getWorkspaceUsers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator((data: { workspaceId: string }) => data)
  .handler(async ({ data, context }) => {
    const { db } = await import('../db');
    const { workspaceMembers } = await import('../db/schema');
    const { eq } = await import('drizzle-orm');

    const workspaceIds = await getUserWorkspaceIds(context.user.id);

    // Verify user has access to this workspace
    if (!workspaceIds.includes(data.workspaceId)) {
      throw new Error('Unauthorized');
    }

    const members = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, data.workspaceId),
      with: {
        user: true,
      },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.role,
      // Generate initials from name
      initials:
        m.user.name
          ?.split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U',
    }));
  });

// Get all users the current user can see (across their workspaces)
export const getUsers = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { db } = await import('../db');
    const { workspaceMembers } = await import('../db/schema');
    const { inArray } = await import('drizzle-orm');

    const workspaceIds = await getUserWorkspaceIds(context.user.id);

    if (workspaceIds.length === 0) {
      return [];
    }

    // Get all members of user's workspaces
    const members = await db.query.workspaceMembers.findMany({
      where: inArray(workspaceMembers.workspaceId, workspaceIds),
      with: {
        user: true,
      },
    });

    // Deduplicate users
    const userMap = new Map<string, {
      id: string;
      name: string;
      email: string;
      initials: string;
    }>();
    
    members.forEach((m) => {
      if (!userMap.has(m.user.id)) {
        userMap.set(m.user.id, {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          initials:
            m.user.name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U',
        });
      }
    });

    return Array.from(userMap.values());
  });
