import { useState } from 'react'
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  Circle,
  CircleDot,
  CircleDashed,
  CircleCheck,
  CircleX,
  AlertTriangle,
  Signal,
  Minus,
} from 'lucide-react'
import type { IssueStatus, IssuePriority } from '../types'
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../types'

const STATUS_ICONS: Record<IssueStatus, React.ReactNode> = {
  backlog: <CircleDashed size={14} />,
  todo: <Circle size={14} />,
  in_progress: <CircleDot size={14} />,
  in_review: <CircleDot size={14} />,
  done: <CircleCheck size={14} />,
  cancelled: <CircleX size={14} />,
}

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertTriangle size={14} />,
  high: <Signal size={14} />,
  medium: <Signal size={14} />,
  low: <Signal size={14} />,
  none: <Minus size={14} />,
}

export function FilterBar({
  title,
  issueCount,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
}: {
  title: string
  issueCount: number
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: IssueStatus[]
  onStatusFilterChange: (statuses: IssueStatus[]) => void
  priorityFilter: IssuePriority[]
  onPriorityFilterChange: (priorities: IssuePriority[]) => void
}) {
  const [showSearch, setShowSearch] = useState(false)
  const [showStatusFilter, setShowStatusFilter] = useState(false)
  const [showPriorityFilter, setShowPriorityFilter] = useState(false)

  const hasFilters = statusFilter.length > 0 || priorityFilter.length > 0 || searchQuery

  const clearFilters = () => {
    onStatusFilterChange([])
    onPriorityFilterChange([])
    onSearchChange('')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Main bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            {title}
          </h1>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              backgroundColor: 'var(--color-bg-tertiary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {issueCount}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: showSearch ? 'var(--color-bg-active)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              if (!showSearch) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
              }
            }}
            onMouseLeave={(e) => {
              if (!showSearch) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <Search size={16} />
          </button>

          {/* Status filter */}
          <FilterDropdown
            isOpen={showStatusFilter}
            onToggle={() => setShowStatusFilter(!showStatusFilter)}
            label="Status"
            icon={<Filter size={14} />}
            hasSelection={statusFilter.length > 0}
          >
            {(Object.keys(STATUS_CONFIG) as IssueStatus[]).map((status) => (
              <FilterOption
                key={status}
                isSelected={statusFilter.includes(status)}
                onClick={() => {
                  if (statusFilter.includes(status)) {
                    onStatusFilterChange(statusFilter.filter((s) => s !== status))
                  } else {
                    onStatusFilterChange([...statusFilter, status])
                  }
                }}
              >
                <span style={{ color: STATUS_CONFIG[status].color }}>
                  {STATUS_ICONS[status]}
                </span>
                <span>{STATUS_CONFIG[status].label}</span>
              </FilterOption>
            ))}
          </FilterDropdown>

          {/* Priority filter */}
          <FilterDropdown
            isOpen={showPriorityFilter}
            onToggle={() => setShowPriorityFilter(!showPriorityFilter)}
            label="Priority"
            icon={<SlidersHorizontal size={14} />}
            hasSelection={priorityFilter.length > 0}
          >
            {(Object.keys(PRIORITY_CONFIG) as IssuePriority[]).map((priority) => (
              <FilterOption
                key={priority}
                isSelected={priorityFilter.includes(priority)}
                onClick={() => {
                  if (priorityFilter.includes(priority)) {
                    onPriorityFilterChange(priorityFilter.filter((p) => p !== priority))
                  } else {
                    onPriorityFilterChange([...priorityFilter, priority])
                  }
                }}
              >
                <span style={{ color: PRIORITY_CONFIG[priority].color }}>
                  {PRIORITY_ICONS[priority]}
                </span>
                <span>{PRIORITY_CONFIG[priority].label}</span>
              </FilterOption>
            ))}
          </FilterDropdown>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: 'var(--color-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                color: 'white',
                transition: 'all var(--transition-fast)',
              }}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div
          style={{
            padding: '0 24px 12px',
          }}
          className="animate-slide-in"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search issues..."
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '13px',
                color: 'var(--color-text-primary)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filters */}
      {(statusFilter.length > 0 || priorityFilter.length > 0) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 24px 12px',
            flexWrap: 'wrap',
          }}
          className="animate-fade-in"
        >
          {statusFilter.map((status) => (
            <FilterChip
              key={status}
              label={STATUS_CONFIG[status].label}
              color={STATUS_CONFIG[status].color}
              onRemove={() => onStatusFilterChange(statusFilter.filter((s) => s !== status))}
            />
          ))}
          {priorityFilter.map((priority) => (
            <FilterChip
              key={priority}
              label={PRIORITY_CONFIG[priority].label}
              color={PRIORITY_CONFIG[priority].color}
              onRemove={() => onPriorityFilterChange(priorityFilter.filter((p) => p !== priority))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterDropdown({
  isOpen,
  onToggle,
  label,
  icon,
  hasSelection,
  children,
}: {
  isOpen: boolean
  onToggle: () => void
  label: string
  icon: React.ReactNode
  hasSelection: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          backgroundColor: hasSelection ? 'var(--color-bg-active)' : 'transparent',
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
        {icon}
        <span>{label}</span>
        <ChevronDown size={12} />
      </button>

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
              right: 0,
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
  )
}

function FilterOption({
  children,
  isSelected,
  onClick,
}: {
  children: React.ReactNode
  isSelected: boolean
  onClick: () => void
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
      <div
        style={{
          width: '14px',
          height: '14px',
          border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border-light)'}`,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isSelected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5L4 7L8 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      {children}
    </button>
  )
}

function FilterChip({
  label,
  color,
  onRemove,
}: {
  label: string
  color: string
  onRemove: () => void
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        backgroundColor: `${color}20`,
        borderRadius: 'var(--radius-sm)',
        fontSize: '11px',
        fontWeight: 500,
        color: color,
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '14px',
          height: '14px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.7,
        }}
      >
        <X size={10} />
      </button>
    </span>
  )
}
