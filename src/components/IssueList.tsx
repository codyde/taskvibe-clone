import { useState, useMemo } from 'react'
import {
  useIssues,
  useActiveView,
  useViews,
  useCurrentUser,
  getFilteredIssues,
  setSelectedIssue,
  useSelectedIssue,
} from '../store'
import { IssueRow } from './IssueRow'
import { FilterBar } from './FilterBar'
import type { IssueStatus, IssuePriority } from '../types'

export function IssueList() {
  const issues = useIssues()
  const activeView = useActiveView()
  const views = useViews()
  const currentUser = useCurrentUser()
  const selectedIssue = useSelectedIssue()

  const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([])
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredIssues = useMemo(() => {
    const view = views.find((v) => v.id === activeView)

    let baseFilter: Parameters<typeof getFilteredIssues>[0] = {}

    if (view?.filter) {
      baseFilter = { ...view.filter }
    }

    if (activeView === 'view-my-issues') {
      baseFilter.assigneeId = currentUser.id
    }

    if (activeView.startsWith('project-')) {
      baseFilter.projectId = activeView.replace('project-', '')
    }

    if (statusFilter.length) {
      baseFilter.status = statusFilter
    }

    if (priorityFilter.length) {
      baseFilter.priority = priorityFilter
    }

    if (searchQuery) {
      baseFilter.search = searchQuery
    }

    return getFilteredIssues(baseFilter)
  }, [issues, activeView, views, currentUser, statusFilter, priorityFilter, searchQuery])

  const groupedIssues = useMemo(() => {
    const groups: Record<IssueStatus, typeof filteredIssues> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    }

    filteredIssues.forEach((issue) => {
      groups[issue.status].push(issue)
    })

    return groups
  }, [filteredIssues])

  const getViewTitle = () => {
    if (activeView.startsWith('project-')) {
      return 'Project Issues'
    }
    const view = views.find((v) => v.id === activeView)
    return view?.name || 'All Issues'
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <FilterBar
        title={getViewTitle()}
        issueCount={filteredIssues.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
      />

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0 0 24px',
        }}
      >
        {Object.entries(groupedIssues).map(([status, issues]) => {
          if (issues.length === 0) return null

          return (
            <IssueGroup
              key={status}
              status={status as IssueStatus}
              issues={issues}
              selectedIssueId={selectedIssue?.id}
              onSelectIssue={setSelectedIssue}
            />
          )
        })}

        {filteredIssues.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'var(--color-text-muted)',
            }}
          >
            <p style={{ fontSize: '14px' }}>No issues found</p>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>
              Try adjusting your filters or create a new issue
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function IssueGroup({
  status,
  issues,
  selectedIssueId,
  onSelectIssue,
}: {
  status: IssueStatus
  issues: ReturnType<typeof useIssues>
  selectedIssueId?: string
  onSelectIssue: (id: string | null) => void
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const STATUS_LABELS: Record<IssueStatus, string> = {
    backlog: 'Backlog',
    todo: 'Todo',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
    cancelled: 'Cancelled',
  }

  return (
    <div style={{ marginBottom: '4px' }}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '8px 24px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        <span
          style={{
            transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)',
            transition: 'transform var(--transition-fast)',
          }}
        >
          &#9662;
        </span>
        <span>{STATUS_LABELS[status]}</span>
        <span
          style={{
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px',
          }}
        >
          {issues.length}
        </span>
      </button>

      {!isCollapsed && (
        <div>
          {issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              isSelected={issue.id === selectedIssueId}
              onSelect={() => onSelectIssue(issue.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
