export type IssueStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none'

export type IssueLabel = {
  id: string
  name: string
  color: string
}

export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
}

export type Project = {
  id: string
  name: string
  key: string
  color: string
  icon?: string
  leadId?: string
  description?: string
}

export type Issue = {
  id: string
  identifier: string
  title: string
  description?: string
  status: IssueStatus
  priority: IssuePriority
  projectId: string
  assigneeId?: string
  creatorId: string
  labels: string[]
  estimate?: number
  dueDate?: string
  createdAt: string
  updatedAt: string
  parentId?: string
  subIssueIds: string[]
}

export type View = {
  id: string
  name: string
  icon: string
  filter?: {
    status?: IssueStatus[]
    priority?: IssuePriority[]
    assigneeId?: string
    projectId?: string
    labels?: string[]
  }
}

export type Workspace = {
  id: string
  name: string
  slug: string
}

export const STATUS_CONFIG: Record<IssueStatus, { label: string; color: string; icon: string }> = {
  backlog: { label: 'Backlog', color: '#6b6478', icon: 'circle-dashed' },
  todo: { label: 'Todo', color: '#a099ad', icon: 'circle' },
  in_progress: { label: 'In Progress', color: '#FF9838', icon: 'circle-dot' },
  in_review: { label: 'In Review', color: '#9D58BF', icon: 'circle-half' },
  done: { label: 'Done', color: '#22c55e', icon: 'circle-check' },
  cancelled: { label: 'Cancelled', color: '#6b6478', icon: 'circle-x' },
}

export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', color: '#FF708C', icon: 'alert-triangle' },
  high: { label: 'High', color: '#FF9838', icon: 'signal' },
  medium: { label: 'Medium', color: '#9D58BF', icon: 'signal' },
  low: { label: 'Low', color: '#6b6478', icon: 'signal' },
  none: { label: 'No priority', color: '#4a4260', icon: 'minus' },
}
