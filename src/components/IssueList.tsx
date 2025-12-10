import { useState, useMemo } from 'react';
import { useActiveView, useViews, setSelectedIssue, useSelectedIssueId } from '../store';
import { useIssues } from '../hooks/useIssues';
import { useSession } from '../lib/auth-client';
import { IssueRow } from './IssueRow';
import { FilterBar } from './FilterBar';
import type { IssueStatus, IssuePriority } from '../db/schema';

export function IssueList() {
  const activeView = useActiveView();
  const views = useViews();
  const selectedIssueId = useSelectedIssueId();
  const { data: session } = useSession();

  const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine filters based on active view
  const viewFilters = useMemo(() => {
    const view = views.find((v) => v.id === activeView);
    const filters: {
      status?: IssueStatus[];
      priority?: IssuePriority[];
      assigneeId?: string;
      projectId?: string;
      search?: string;
    } = {};

    if (view?.filter) {
      if (view.filter.status?.length) filters.status = view.filter.status;
      if (view.filter.priority?.length) filters.priority = view.filter.priority;
    }

    if (activeView === 'view-my-issues' && session?.user?.id) {
      filters.assigneeId = session.user.id;
    }

    if (activeView.startsWith('project-')) {
      filters.projectId = activeView.replace('project-', '');
    }

    // Apply user filters
    if (statusFilter.length) filters.status = statusFilter;
    if (priorityFilter.length) filters.priority = priorityFilter;
    if (searchQuery) filters.search = searchQuery;

    return filters;
  }, [activeView, views, session, statusFilter, priorityFilter, searchQuery]);

  const { data: issues = [], isLoading } = useIssues(viewFilters);

  const groupedIssues = useMemo(() => {
    type IssueItem = (typeof issues)[number];
    const groups: Record<IssueStatus, IssueItem[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    issues.forEach((issue) => {
      groups[issue.status as IssueStatus].push(issue);
    });

    return groups;
  }, [issues]);

  const getViewTitle = () => {
    if (activeView.startsWith('project-')) {
      return 'Project Issues';
    }
    const view = views.find((v) => v.id === activeView);
    return view?.name || 'All Issues';
  };

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
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
        issueCount={issues.length}
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
        {Object.entries(groupedIssues).map(([status, statusIssues]) => {
          if (statusIssues.length === 0) return null;

          return (
            <IssueGroup
              key={status}
              status={status as IssueStatus}
              issues={statusIssues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={setSelectedIssue}
            />
          );
        })}

        {issues.length === 0 && (
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
  );
}

function IssueGroup({
  status,
  issues,
  selectedIssueId,
  onSelectIssue,
}: {
  status: IssueStatus;
  issues: any[];
  selectedIssueId?: string | null;
  onSelectIssue: (id: string | null) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const STATUS_LABELS: Record<IssueStatus, string> = {
    backlog: 'Backlog',
    todo: 'Todo',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
    cancelled: 'Cancelled',
  };

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
  );
}
