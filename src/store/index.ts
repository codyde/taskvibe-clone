import { useState, useCallback, useSyncExternalStore } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Issue, Project, User, IssueLabel, View, IssueStatus, IssuePriority } from '../types'

type Store = {
  issues: Issue[]
  projects: Project[]
  users: User[]
  labels: IssueLabel[]
  views: View[]
  currentUser: User
  selectedIssueId: string | null
  activeView: string
}

const INITIAL_USERS: User[] = [
  { id: 'user-1', name: 'You', email: 'you@example.com', initials: 'Y' },
]

const INITIAL_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'My Project', key: 'PRJ', color: '#9D58BF', description: 'Your first project' },
]

const INITIAL_LABELS: IssueLabel[] = [
  { id: 'label-1', name: 'Bug', color: '#FF708C' },
  { id: 'label-2', name: 'Feature', color: '#9D58BF' },
  { id: 'label-3', name: 'Improvement', color: '#FF9838' },
]

const INITIAL_ISSUES: Issue[] = []

const INITIAL_VIEWS: View[] = [
  { id: 'view-inbox', name: 'Inbox', icon: 'inbox' },
  { id: 'view-my-issues', name: 'My Issues', icon: 'user' },
  { id: 'view-active', name: 'Active', icon: 'circle-dot', filter: { status: ['in_progress', 'in_review'] } },
  { id: 'view-backlog', name: 'Backlog', icon: 'layers', filter: { status: ['backlog'] } },
]

let store: Store = {
  issues: INITIAL_ISSUES,
  projects: INITIAL_PROJECTS,
  users: INITIAL_USERS,
  labels: INITIAL_LABELS,
  views: INITIAL_VIEWS,
  currentUser: INITIAL_USERS[0],
  selectedIssueId: null,
  activeView: 'view-inbox',
}

const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return store
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useIssues() {
  const { issues } = useStore()
  return issues
}

export function useProjects() {
  const { projects } = useStore()
  return projects
}

export function useUsers() {
  const { users } = useStore()
  return users
}

export function useLabels() {
  const { labels } = useStore()
  return labels
}

export function useViews() {
  const { views } = useStore()
  return views
}

export function useCurrentUser() {
  const { currentUser } = useStore()
  return currentUser
}

export function useSelectedIssue() {
  const { issues, selectedIssueId } = useStore()
  return selectedIssueId ? issues.find((i) => i.id === selectedIssueId) : null
}

export function useActiveView() {
  const { activeView } = useStore()
  return activeView
}

export function getProjectById(id: string) {
  return store.projects.find((p) => p.id === id)
}

export function getUserById(id: string) {
  return store.users.find((u) => u.id === id)
}

export function getLabelById(id: string) {
  return store.labels.find((l) => l.id === id)
}

export function setSelectedIssue(issueId: string | null) {
  store = { ...store, selectedIssueId: issueId }
  emitChange()
}

export function setActiveView(viewId: string) {
  store = { ...store, activeView: viewId }
  emitChange()
}

export function createIssue(data: Omit<Issue, 'id' | 'identifier' | 'createdAt' | 'updatedAt' | 'subIssueIds'>) {
  const project = store.projects.find((p) => p.id === data.projectId)
  if (!project) return

  const projectIssues = store.issues.filter((i) => i.projectId === data.projectId)
  const nextNumber = projectIssues.length + 1

  const newIssue: Issue = {
    ...data,
    id: uuidv4(),
    identifier: `${project.key}-${nextNumber}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subIssueIds: [],
  }

  store = { ...store, issues: [...store.issues, newIssue] }
  emitChange()
  return newIssue
}

export function updateIssue(issueId: string, updates: Partial<Issue>) {
  store = {
    ...store,
    issues: store.issues.map((issue) =>
      issue.id === issueId
        ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
        : issue
    ),
  }
  emitChange()
}

export function deleteIssue(issueId: string) {
  store = {
    ...store,
    issues: store.issues.filter((i) => i.id !== issueId),
    selectedIssueId: store.selectedIssueId === issueId ? null : store.selectedIssueId,
  }
  emitChange()
}

export function getFilteredIssues(filter?: {
  status?: IssueStatus[]
  priority?: IssuePriority[]
  assigneeId?: string
  projectId?: string
  labels?: string[]
  search?: string
}) {
  let filtered = [...store.issues]

  if (filter?.status?.length) {
    filtered = filtered.filter((i) => filter.status!.includes(i.status))
  }

  if (filter?.priority?.length) {
    filtered = filtered.filter((i) => filter.priority!.includes(i.priority))
  }

  if (filter?.assigneeId) {
    filtered = filtered.filter((i) => i.assigneeId === filter.assigneeId)
  }

  if (filter?.projectId) {
    filtered = filtered.filter((i) => i.projectId === filter.projectId)
  }

  if (filter?.labels?.length) {
    filtered = filtered.filter((i) => filter.labels!.some((l) => i.labels.includes(l)))
  }

  if (filter?.search) {
    const search = filter.search.toLowerCase()
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(search) ||
        i.identifier.toLowerCase().includes(search) ||
        i.description?.toLowerCase().includes(search)
    )
  }

  return filtered
}
