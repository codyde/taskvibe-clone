import {
  pgTable,
  text,
  varchar,
  timestamp,
  pgEnum,
  integer,
  primaryKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Re-export auth schema
export * from './auth-schema';
import { user } from './auth-schema';

// Enums
export const issueStatusEnum = pgEnum('issue_status', [
  'backlog',
  'todo',
  'in_progress',
  'in_review',
  'done',
  'cancelled',
]);

export const issuePriorityEnum = pgEnum('issue_priority', [
  'urgent',
  'high',
  'medium',
  'low',
  'none',
]);

export const workspaceRoleEnum = pgEnum('workspace_role', [
  'owner',
  'admin',
  'member',
]);

// Workspaces
export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  icon: text('icon'),
  ownerId: text('owner_id')
    .references(() => user.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workspace membership (many-to-many: users <-> workspaces)
export const workspaceMembers = pgTable('workspace_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  role: workspaceRoleEnum('role').notNull().default('member'),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
});

// Projects
export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  key: varchar('key', { length: 10 }).notNull(),
  color: varchar('color', { length: 7 }).notNull().default('#9D58BF'),
  icon: text('icon'),
  description: text('description'),
  leadId: text('lead_id').references(() => user.id),
  issueCounter: integer('issue_counter').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Labels
export const labels = pgTable('labels', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
});

// Issues
export const issues = pgTable('issues', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  identifier: varchar('identifier', { length: 20 }).notNull().unique(),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: issueStatusEnum('status').notNull().default('backlog'),
  priority: issuePriorityEnum('priority').notNull().default('none'),
  projectId: text('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  assigneeId: text('assignee_id').references(() => user.id),
  creatorId: text('creator_id')
    .references(() => user.id)
    .notNull(),
  parentId: text('parent_id'),
  estimate: integer('estimate'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Issue-Label junction table
export const issueLabels = pgTable(
  'issue_labels',
  {
    issueId: text('issue_id')
      .references(() => issues.id, { onDelete: 'cascade' })
      .notNull(),
    labelId: text('label_id')
      .references(() => labels.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.labelId] })]
);

// Webhooks (one per workspace for MVP)
export const webhooks = pgTable('webhooks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id')
    .references(() => workspaces.id, { onDelete: 'cascade' })
    .notNull()
    .unique(), // Only one webhook per workspace for MVP
  url: text('url').notNull(),
  secret: text('secret'), // Optional HMAC signing secret
  enabled: boolean('enabled').notNull().default(true),
  events: text('events').array().notNull(), // ['issue.created', 'issue.updated', ...]
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(user, { fields: [workspaces.ownerId], references: [user.id] }),
  members: many(workspaceMembers),
  projects: many(projects),
  labels: many(labels),
  webhook: one(webhooks),
}));

export const webhooksRelations = relations(webhooks, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [webhooks.workspaceId],
    references: [workspaces.id],
  }),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(user, { fields: [workspaceMembers.userId], references: [user.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  lead: one(user, { fields: [projects.leadId], references: [user.id] }),
  issues: many(issues),
}));

export const labelsRelations = relations(labels, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [labels.workspaceId],
    references: [workspaces.id],
  }),
  issueLabels: many(issueLabels),
}));

export const issuesRelations = relations(issues, ({ one, many }) => ({
  project: one(projects, { fields: [issues.projectId], references: [projects.id] }),
  assignee: one(user, {
    fields: [issues.assigneeId],
    references: [user.id],
    relationName: 'assignee',
  }),
  creator: one(user, {
    fields: [issues.creatorId],
    references: [user.id],
    relationName: 'creator',
  }),
  parent: one(issues, {
    fields: [issues.parentId],
    references: [issues.id],
    relationName: 'parent',
  }),
  subIssues: many(issues, { relationName: 'parent' }),
  issueLabels: many(issueLabels),
}));

export const issueLabelsRelations = relations(issueLabels, ({ one }) => ({
  issue: one(issues, { fields: [issueLabels.issueId], references: [issues.id] }),
  label: one(labels, { fields: [issueLabels.labelId], references: [labels.id] }),
}));

// Type exports (inferred from schema)
export type IssueStatus = (typeof issueStatusEnum.enumValues)[number];
export type IssuePriority = (typeof issuePriorityEnum.enumValues)[number];
export type WorkspaceRole = (typeof workspaceRoleEnum.enumValues)[number];

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

export type Label = typeof labels.$inferSelect;
export type NewLabel = typeof labels.$inferInsert;

export type User = typeof user.$inferSelect;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

// Webhook event types
export const WEBHOOK_EVENTS = [
  'issue.created',
  'issue.updated',
  'issue.deleted',
  'project.created',
  'project.updated',
  'project.deleted',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
