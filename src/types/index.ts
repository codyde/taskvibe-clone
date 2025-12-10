// Re-export types from database schema
export type {
  IssueStatus,
  IssuePriority,
  Issue,
  Project,
  Label as IssueLabel,
  User,
  Workspace,
  WorkspaceRole,
} from '../db/schema';

// Re-export UI config from store
export { STATUS_CONFIG, PRIORITY_CONFIG } from '../store';
export type { View } from '../store';
