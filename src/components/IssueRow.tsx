import {
  Circle,
  CircleDot,
  CircleDashed,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Signal,
  Minus,
  Calendar,
} from 'lucide-react';
import type { IssueStatus, IssuePriority } from '../db/schema';

const STATUS_ICONS: Record<IssueStatus, React.ReactNode> = {
  backlog: <CircleDashed size={14} style={{ color: '#6b6478' }} />,
  todo: <Circle size={14} style={{ color: '#a099ad' }} />,
  in_progress: <CircleDot size={14} style={{ color: '#FF9838' }} />,
  in_review: <CircleDot size={14} style={{ color: '#9D58BF' }} />,
  done: <CircleCheck size={14} style={{ color: '#22c55e' }} />,
  cancelled: <CircleX size={14} style={{ color: '#6b6478' }} />,
};

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertTriangle size={14} style={{ color: '#FF708C' }} />,
  high: <Signal size={14} style={{ color: '#FF9838' }} />,
  medium: <Signal size={14} style={{ color: '#9D58BF' }} />,
  low: <Signal size={14} style={{ color: '#6b6478' }} />,
  none: <Minus size={14} style={{ color: '#4a4260' }} />,
};

// Issue type with included relations
type IssueWithRelations = {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  estimate?: number | null;
  dueDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  project?: { id: string; name: string; color: string } | null;
  assignee?: { id: string; name: string; email: string } | null;
  labels?: Array<{ id: string; name: string; color: string }>;
};

export function IssueRow({
  issue,
  isSelected,
  onSelect,
}: {
  issue: IssueWithRelations;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const assignee = issue.assignee;
  const labels = issue.labels || [];

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 24px',
        backgroundColor: isSelected ? 'var(--color-bg-active)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)',
        borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {/* Priority */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        title={issue.priority}
      >
        {PRIORITY_ICONS[issue.priority]}
      </span>

      {/* Identifier */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
          minWidth: '60px',
        }}
      >
        {issue.identifier}
      </span>

      {/* Status */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        title={issue.status.replace('_', ' ')}
      >
        {STATUS_ICONS[issue.status]}
      </span>

      {/* Title */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {issue.title}
      </span>

      {/* Labels */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        {labels.slice(0, 2).map((label) => (
          <span
            key={label.id}
            style={{
              padding: '2px 6px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 500,
              backgroundColor: `${label.color}20`,
              color: label.color,
            }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {/* Due date */}
      {issue.dueDate && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          <Calendar size={12} />
          {new Date(issue.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      )}

      {/* Estimate */}
      {issue.estimate && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
          }}
        >
          {issue.estimate}
        </span>
      )}

      {/* Assignee */}
      {assignee ? (
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 600,
            color: 'white',
            flexShrink: 0,
          }}
          title={assignee.name}
        >
          {assignee.name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U'}
        </div>
      ) : (
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '1px dashed var(--color-border-light)',
            flexShrink: 0,
          }}
          title="Unassigned"
        />
      )}
    </div>
  );
}
