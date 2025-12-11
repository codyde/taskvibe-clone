import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Circle, CircleDot, CircleDashed, AlertTriangle, Signal, Minus } from 'lucide-react';
import { useIssues } from '../hooks/useIssues';
import { setSelectedIssue } from '../store';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../store';
import type { IssueStatus, IssuePriority } from '../db/schema';

const STATUS_ICONS: Record<IssueStatus, React.ReactNode> = {
  backlog: <CircleDashed size={14} />,
  todo: <Circle size={14} />,
  in_progress: <CircleDot size={14} />,
  in_review: <CircleDot size={14} />,
  done: <Circle size={14} />,
  cancelled: <Circle size={14} />,
};

const PRIORITY_ICONS: Record<IssuePriority, React.ReactNode> = {
  urgent: <AlertTriangle size={12} />,
  high: <Signal size={12} />,
  medium: <Signal size={12} />,
  low: <Signal size={12} />,
  none: <Minus size={12} />,
};

type IssueResult = {
  id: string;
  identifier: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  project?: { name: string; color: string } | null;
};

export function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch all issues - we'll filter client-side for instant results
  const { data: allIssues = [], isLoading } = useIssues();

  // Filter issues based on search query
  const filteredIssues = useMemo(() => {
    if (!query.trim()) {
      // Show recent issues when no query
      return (allIssues as IssueResult[]).slice(0, 10);
    }

    const lowerQuery = query.toLowerCase();
    return (allIssues as IssueResult[]).filter(
      (issue) =>
        issue.title.toLowerCase().includes(lowerQuery) ||
        issue.identifier.toLowerCase().includes(lowerQuery)
    );
  }, [allIssues, query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredIssues.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && filteredIssues.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredIssues.length]);

  const handleSelectIssue = (issue: IssueResult) => {
    setSelectedIssue(issue.id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredIssues.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredIssues[selectedIndex]) {
          handleSelectIssue(filteredIssues[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              fontSize: '15px',
              color: 'var(--color-text-primary)',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            placeholder="Search issues..."
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              <X size={12} />
            </button>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <kbd
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-bg-tertiary)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
              }}
            >
              esc
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div
          ref={resultsRef}
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
              }}
            >
              Loading issues...
            </div>
          ) : filteredIssues.length === 0 ? (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
              }}
            >
              {query ? 'No issues found' : 'No issues yet'}
            </div>
          ) : (
            <>
              {!query && (
                <div
                  style={{
                    padding: '8px 16px 4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Recent Issues
                </div>
              )}
              {filteredIssues.map((issue, index) => (
                <SearchResultItem
                  key={issue.id}
                  issue={issue}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelectIssue(issue)}
                  onMouseEnter={() => setSelectedIndex(index)}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-tertiary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border)',
                }}
              >
                ↑
              </kbd>
              <kbd
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  padding: '2px 4px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border)',
                }}
              >
                ↓
              </kbd>
              navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <kbd
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid var(--color-border)',
                }}
              >
                ↵
              </kbd>
              select
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {filteredIssues.length} {filteredIssues.length === 1 ? 'result' : 'results'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SearchResultItem({
  issue,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  issue: IssueResult;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '10px 16px',
        backgroundColor: isSelected ? 'var(--color-bg-hover)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.1s',
      }}
    >
      {/* Status icon */}
      <span style={{ color: STATUS_CONFIG[issue.status].color, flexShrink: 0 }}>
        {STATUS_ICONS[issue.status]}
      </span>

      {/* Identifier */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          flexShrink: 0,
          minWidth: '70px',
        }}
      >
        {issue.identifier}
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

      {/* Priority */}
      <span
        style={{
          color: PRIORITY_CONFIG[issue.priority].color,
          flexShrink: 0,
          opacity: issue.priority === 'none' ? 0.5 : 1,
        }}
      >
        {PRIORITY_ICONS[issue.priority]}
      </span>

      {/* Project badge */}
      {issue.project && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            padding: '2px 6px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '2px',
              backgroundColor: issue.project.color,
            }}
          />
          {issue.project.name}
        </span>
      )}
    </button>
  );
}
