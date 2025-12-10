import { useState } from 'react'
import {
  X,
  Circle,
  CircleDot,
  CircleDashed,
  AlertTriangle,
  Signal,
  Minus,
  ChevronDown,
  User,
} from 'lucide-react'
import { createIssue, useProjects, useUsers, useLabels, useCurrentUser } from '../store'
import type { IssueStatus, IssuePriority } from '../types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../types'

const STATUS_ICONS: Record<IssueStatus, React.ReactNode> = {
  backlog: <CircleDashed size={14} />,
  todo: <Circle size={14} />,
  in_progress: <CircleDot size={14} />,
  in_review: <CircleDot size={14} />,
  done: <Circle size={14} />,
  cancelled: <Circle size={14} />,
}

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertTriangle size={14} />,
  high: <Signal size={14} />,
  medium: <Signal size={14} />,
  low: <Signal size={14} />,
  none: <Minus size={14} />,
}

export function CreateIssueModal({ onClose }: { onClose: () => void }) {
  const projects = useProjects()
  const users = useUsers()
  const labels = useLabels()
  const currentUser = useCurrentUser()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<IssueStatus>('todo')
  const [priority, setPriority] = useState<IssuePriority>('none')
  const [projectId, setProjectId] = useState(projects[0]?.id || '')
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false)

  const selectedProject = projects.find((p) => p.id === projectId)
  const selectedAssignee = assigneeId ? users.find((u) => u.id === assigneeId) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !projectId) return

    createIssue({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      projectId,
      assigneeId,
      creatorId: currentUser.id,
      labels: selectedLabels,
    })

    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
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
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              New Issue
            </span>
            {selectedProject && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  padding: '2px 8px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: selectedProject.color,
                  }}
                />
                {selectedProject.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ padding: '16px' }}>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0',
                marginBottom: '12px',
              }}
              placeholder="Issue title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                minHeight: '80px',
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'transparent',
                border: 'none',
                padding: '0',
                resize: 'vertical',
              }}
              placeholder="Add description..."
            />
          </div>

          {/* Properties */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderTop: '1px solid var(--color-border)',
              flexWrap: 'wrap',
            }}
          >
            {/* Status */}
            <Dropdown
              isOpen={showStatusDropdown}
              onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
              trigger={
                <PropertyPill>
                  <span style={{ color: STATUS_CONFIG[status].color }}>
                    {STATUS_ICONS[status]}
                  </span>
                  <span>{STATUS_CONFIG[status].label}</span>
                </PropertyPill>
              }
            >
              {(Object.keys(STATUS_CONFIG) as IssueStatus[])
                .filter((s) => s !== 'cancelled')
                .map((s) => (
                  <DropdownItem
                    key={s}
                    onClick={() => {
                      setStatus(s)
                      setShowStatusDropdown(false)
                    }}
                    isSelected={status === s}
                  >
                    <span style={{ color: STATUS_CONFIG[s].color }}>{STATUS_ICONS[s]}</span>
                    <span>{STATUS_CONFIG[s].label}</span>
                  </DropdownItem>
                ))}
            </Dropdown>

            {/* Priority */}
            <Dropdown
              isOpen={showPriorityDropdown}
              onToggle={() => setShowPriorityDropdown(!showPriorityDropdown)}
              trigger={
                <PropertyPill>
                  <span style={{ color: PRIORITY_CONFIG[priority].color }}>
                    {PRIORITY_ICONS[priority]}
                  </span>
                  <span>{PRIORITY_CONFIG[priority].label}</span>
                </PropertyPill>
              }
            >
              {(Object.keys(PRIORITY_CONFIG) as IssuePriority[]).map((p) => (
                <DropdownItem
                  key={p}
                  onClick={() => {
                    setPriority(p)
                    setShowPriorityDropdown(false)
                  }}
                  isSelected={priority === p}
                >
                  <span style={{ color: PRIORITY_CONFIG[p].color }}>{PRIORITY_ICONS[p]}</span>
                  <span>{PRIORITY_CONFIG[p].label}</span>
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Project */}
            <Dropdown
              isOpen={showProjectDropdown}
              onToggle={() => setShowProjectDropdown(!showProjectDropdown)}
              trigger={
                <PropertyPill>
                  {selectedProject && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '2px',
                        backgroundColor: selectedProject.color,
                      }}
                    />
                  )}
                  <span>{selectedProject?.name || 'Project'}</span>
                </PropertyPill>
              }
            >
              {projects.map((p) => (
                <DropdownItem
                  key={p.id}
                  onClick={() => {
                    setProjectId(p.id)
                    setShowProjectDropdown(false)
                  }}
                  isSelected={projectId === p.id}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      backgroundColor: p.color,
                    }}
                  />
                  <span>{p.name}</span>
                </DropdownItem>
              ))}
            </Dropdown>

            {/* Assignee */}
            <Dropdown
              isOpen={showAssigneeDropdown}
              onToggle={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
              trigger={
                <PropertyPill>
                  {selectedAssignee ? (
                    <>
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '7px',
                          fontWeight: 600,
                          color: 'white',
                        }}
                      >
                        {selectedAssignee.initials}
                      </div>
                      <span>{selectedAssignee.name}</span>
                    </>
                  ) : (
                    <>
                      <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>Assignee</span>
                    </>
                  )}
                </PropertyPill>
              }
            >
              <DropdownItem
                onClick={() => {
                  setAssigneeId(undefined)
                  setShowAssigneeDropdown(false)
                }}
                isSelected={!assigneeId}
              >
                <User size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span>Unassigned</span>
              </DropdownItem>
              {users.map((u) => (
                <DropdownItem
                  key={u.id}
                  onClick={() => {
                    setAssigneeId(u.id)
                    setShowAssigneeDropdown(false)
                  }}
                  isSelected={assigneeId === u.id}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '7px',
                      fontWeight: 600,
                      color: 'white',
                    }}
                  >
                    {u.initials}
                  </div>
                  <span>{u.name}</span>
                </DropdownItem>
              ))}
            </Dropdown>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '12px 16px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: title.trim() ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 500,
                color: title.trim() ? 'white' : 'var(--color-text-muted)',
                transition: 'all var(--transition-fast)',
              }}
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PropertyPill({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border-light)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {children}
    </button>
  )
}

function Dropdown({
  isOpen,
  onToggle,
  trigger,
  children,
}: {
  isOpen: boolean
  onToggle: () => void
  trigger: React.ReactNode
  children: React.ReactNode
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
              bottom: '100%',
              left: 0,
              marginBottom: '4px',
              minWidth: '160px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 20,
              overflow: 'hidden',
              maxHeight: '200px',
              overflowY: 'auto',
            }}
            className="animate-scale-in"
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}

function DropdownItem({
  children,
  onClick,
  isSelected,
}: {
  children: React.ReactNode
  onClick: () => void
  isSelected?: boolean
}) {
  return (
    <button
      type="button"
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
        fontSize: '12px',
        color: 'var(--color-text-secondary)',
        transition: 'all var(--transition-fast)',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isSelected
          ? 'var(--color-bg-active)'
          : 'transparent'
      }}
    >
      {children}
    </button>
  )
}
