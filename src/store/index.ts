import { useSyncExternalStore } from 'react';
import type { IssueStatus, IssuePriority } from '../db/schema';

// UI-only state (not persisted to database)
type View = {
  id: string;
  name: string;
  icon: string;
  filter?: {
    status?: IssueStatus[];
    priority?: IssuePriority[];
    assigneeId?: string;
    projectId?: string;
    labels?: string[];
  };
};

type UIStore = {
  selectedIssueId: string | null;
  activeView: string;
  views: View[];
};

// Default views (stored in memory for now, could be moved to DB later)
const DEFAULT_VIEWS: View[] = [
  { id: 'view-inbox', name: 'Inbox', icon: 'inbox' },
  { id: 'view-my-issues', name: 'My Issues', icon: 'user' },
  {
    id: 'view-active',
    name: 'Active',
    icon: 'circle-dot',
    filter: { status: ['in_progress', 'in_review'] },
  },
  { id: 'view-backlog', name: 'Backlog', icon: 'layers', filter: { status: ['backlog'] } },
];

let store: UIStore = {
  selectedIssueId: null,
  activeView: 'view-inbox',
  views: DEFAULT_VIEWS,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return store;
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// UI State hooks
export function useSelectedIssueId() {
  const { selectedIssueId } = useStore();
  return selectedIssueId;
}

export function useActiveView() {
  const { activeView } = useStore();
  return activeView;
}

export function useViews() {
  const { views } = useStore();
  return views;
}

// UI State setters
export function setSelectedIssue(issueId: string | null) {
  store = { ...store, selectedIssueId: issueId };
  emitChange();
}

export function setActiveView(viewId: string) {
  store = { ...store, activeView: viewId };
  emitChange();
}

// Re-export types for compatibility
export type { View };

// Constants for status and priority (UI display config)
export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; color: string; icon: string }
> = {
  backlog: { label: 'Backlog', color: '#6b6478', icon: 'circle-dashed' },
  todo: { label: 'Todo', color: '#a099ad', icon: 'circle' },
  in_progress: { label: 'In Progress', color: '#FF9838', icon: 'circle-dot' },
  in_review: { label: 'In Review', color: '#9D58BF', icon: 'circle-half' },
  done: { label: 'Done', color: '#22c55e', icon: 'circle-check' },
  cancelled: { label: 'Cancelled', color: '#6b6478', icon: 'circle-x' },
};

export const PRIORITY_CONFIG: Record<
  IssuePriority,
  { label: string; color: string; icon: string }
> = {
  urgent: { label: 'Urgent', color: '#FF708C', icon: 'alert-triangle' },
  high: { label: 'High', color: '#FF9838', icon: 'signal' },
  medium: { label: 'Medium', color: '#9D58BF', icon: 'signal' },
  low: { label: 'Low', color: '#6b6478', icon: 'signal' },
  none: { label: 'No priority', color: '#4a4260', icon: 'minus' },
};
