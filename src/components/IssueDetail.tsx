import { useState, useEffect } from 'react';
import {
  X,
  Circle,
  CircleDot,
  CircleDashed,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Signal,
  Minus,
  User,
  Trash2,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { useSelectedIssueId, setSelectedIssue, STATUS_CONFIG, PRIORITY_CONFIG } from '../store';
import { useIssue, useUpdateIssue, useDeleteIssue } from '../hooks/useIssues';
import { useUsers } from '../hooks/useUsers';
import type { IssueStatus, IssuePriority } from '../db/schema';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

const STATUS_ICONS: Record<IssueStatus, React.ReactNode> = {
  backlog: <CircleDashed size={14} />,
  todo: <Circle size={14} />,
  in_progress: <CircleDot size={14} />,
  in_review: <CircleDot size={14} />,
  done: <CircleCheck size={14} />,
  cancelled: <CircleX size={14} />,
};

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertTriangle size={14} />,
  high: <Signal size={14} />,
  medium: <Signal size={14} />,
  low: <Signal size={14} />,
  none: <Minus size={14} />,
};

export function IssueDetail() {
  const selectedIssueId = useSelectedIssueId();
  const { data: issue, isLoading } = useIssue(selectedIssueId);
  const { data: users = [] } = useUsers();
  const updateIssueMutation = useUpdateIssue();
  const deleteIssueMutation = useDeleteIssue();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update local state when issue changes
  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description || '');
    }
  }, [issue]);

  if (isLoading) {
    return (
      <div
        style={{
          width: '400px',
          minWidth: '400px',
          height: '100vh',
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
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

  if (!issue) {
    return (
      <div
        style={{
          width: '400px',
          minWidth: '400px',
          height: '100vh',
          backgroundColor: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
        }}
      >
        <p>Select an issue to view details</p>
      </div>
    );
  }

  // Get project and assignee from issue relations
  const project = issue.project;
  const assignee = issue.assignee;
  const issueLabels = issue.labels || [];

  const handleTitleBlur = () => {
    if (title !== issue.title) {
      updateIssueMutation.mutate({ issueId: issue.id, title });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== issue.description) {
      updateIssueMutation.mutate({ issueId: issue.id, description });
    }
  };

  const handleDelete = () => {
    deleteIssueMutation.mutate(issue.id, {
      onSuccess: () => {
        setSelectedIssue(null);
      },
    });
  };

  const handleStatusChange = (status: IssueStatus) => {
    updateIssueMutation.mutate({ issueId: issue.id, status });
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (priority: IssuePriority) => {
    updateIssueMutation.mutate({ issueId: issue.id, priority });
    setShowPriorityDropdown(false);
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    updateIssueMutation.mutate({ issueId: issue.id, assigneeId });
    setShowAssigneeDropdown(false);
  };

  return (
    <div
      style={{
        width: '400px',
        minWidth: '400px',
        height: '100vh',
        backgroundColor: 'var(--color-bg-secondary)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {issue.identifier}
          </span>
          {project && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  backgroundColor: project.color,
                }}
              />
              {project.name}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <IconButton onClick={() => navigator.clipboard.writeText(issue.identifier)}>
            <Copy size={14} />
          </IconButton>
          <IconButton onClick={() => setShowDeleteDialog(true)}>
            <Trash2 size={14} />
          </IconButton>
          <IconButton onClick={() => setSelectedIssue(null)}>
            <X size={14} />
          </IconButton>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          style={{
            width: '100%',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '4px 0',
            marginBottom: '12px',
          }}
          placeholder="Issue title"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          style={{
            width: '100%',
            minHeight: '100px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
            border: 'none',
            padding: '4px 0',
            resize: 'vertical',
            marginBottom: '24px',
          }}
          placeholder="Add description..."
        />

        {/* Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Status */}
          <PropertyRow label="Status">
            <Dropdown
              isOpen={showStatusDropdown}
              onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
              trigger={
                <PropertyButton>
                  <span style={{ color: STATUS_CONFIG[issue.status as IssueStatus].color }}>
                    {STATUS_ICONS[issue.status as IssueStatus]}
                  </span>
                  <span>{STATUS_CONFIG[issue.status as IssueStatus].label}</span>
                  <ChevronDown size={12} />
                </PropertyButton>
              }
            >
              {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map((status) => (
                <DropdownItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  isSelected={issue.status === status}
                >
                  <span style={{ color: STATUS_CONFIG[status].color }}>
                    {STATUS_ICONS[status]}
                  </span>
                  <span>{STATUS_CONFIG[status].label}</span>
                </DropdownItem>
              ))}
            </Dropdown>
          </PropertyRow>

          {/* Priority */}
          <PropertyRow label="Priority">
            <Dropdown
              isOpen={showPriorityDropdown}
              onToggle={() => setShowPriorityDropdown(!showPriorityDropdown)}
              trigger={
                <PropertyButton>
                  <span style={{ color: PRIORITY_CONFIG[issue.priority as IssuePriority].color }}>
                    {PRIORITY_ICONS[issue.priority as IssuePriority]}
                  </span>
                  <span>{PRIORITY_CONFIG[issue.priority as IssuePriority].label}</span>
                  <ChevronDown size={12} />
                </PropertyButton>
              }
            >
              {(Object.keys(PRIORITY_CONFIG) as IssuePriority[]).map((priority) => (
                <DropdownItem
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  isSelected={issue.priority === priority}
                >
                  <span style={{ color: PRIORITY_CONFIG[priority].color }}>
                    {PRIORITY_ICONS[priority]}
                  </span>
                  <span>{PRIORITY_CONFIG[priority].label}</span>
                </DropdownItem>
              ))}
            </Dropdown>
          </PropertyRow>

          {/* Assignee */}
          <PropertyRow label="Assignee">
            <Dropdown
              isOpen={showAssigneeDropdown}
              onToggle={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              trigger={
                <PropertyButton>
                  {assignee ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          fontWeight: 600,
                          color: 'white',
                        }}
                      >
                        {assignee.name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </div>
                      <span>{assignee.name}</span>
                    </>
                  ) : (
                    <>
                      <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span style={{ color: 'var(--color-text-muted)' }}>Unassigned</span>
                    </>
                  )}
                  <ChevronDown size={12} />
                </PropertyButton>
              }
            >
              <DropdownItem
                onClick={() => handleAssigneeChange(null)}
                isSelected={!issue.assigneeId}
              >
                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Unassigned</span>
              </DropdownItem>
              {users.map((u: { id: string; name: string; initials?: string }) => (
                <DropdownItem
                  key={u.id}
                  onClick={() => handleAssigneeChange(u.id)}
                  isSelected={issue.assigneeId === u.id}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {u.initials || u.name?.charAt(0) || 'U'}
                  </div>
                  <span>{u.name}</span>
                </DropdownItem>
              ))}
            </Dropdown>
          </PropertyRow>

          {/* Labels */}
          <PropertyRow label="Labels">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {issueLabels.length > 0 ? (
                issueLabels.map((label: { id: string; name: string; color: string }) => (
                  <span
                    key={label.id}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  No labels
                </span>
              )}
            </div>
          </PropertyRow>

          {/* Estimate */}
          <PropertyRow label="Estimate">
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {issue.estimate ? `${issue.estimate} points` : 'No estimate'}
            </span>
          </PropertyRow>

          {/* Dates */}
          <PropertyRow label="Created">
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {new Date(issue.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </PropertyRow>

          <PropertyRow label="Updated">
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {new Date(issue.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </PropertyRow>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        itemName={issue.title}
      />
    </div>
  );
}

function IconButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function PropertyRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}
    >
      <span
        style={{
          width: '80px',
          flexShrink: 0,
          fontSize: '12px',
          color: 'var(--color-text-muted)',
          paddingTop: '4px',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function PropertyButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function Dropdown({
  isOpen,
  onToggle,
  trigger,
  children,
}: {
  isOpen: boolean;
  onToggle: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={onToggle}>{trigger}</div>
      {isOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
            }}
            onClick={onToggle}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              minWidth: '180px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 20,
              overflow: 'hidden',
            }}
            className="animate-scale-in"
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({
  children,
  onClick,
  isSelected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '8px 12px',
        backgroundColor: isSelected ? 'var(--color-bg-active)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? 'var(--color-bg-active)'
          : 'transparent';
      }}
    >
      {children}
    </button>
  );
}
