import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Command,
  Plus,
  Search,
  Home,
  User,
  CircleDot,
  Layers,
  Settings,
  LogOut,
  Trash2,
  FolderPlus,
  X,
} from 'lucide-react';
import { setActiveView, useSelectedIssueId, setSelectedIssue } from '../store';
import { useDeleteIssue } from '../hooks/useIssues';
import { useProjects } from '../hooks/useProjects';
import { signOut } from '../lib/auth-client';

type CommandCategory = 'create' | 'navigation' | 'actions' | 'projects';

type CommandItem = {
  id: string;
  label: string;
  category: CommandCategory;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  danger?: boolean;
};

const CATEGORY_LABELS: Record<CommandCategory, string> = {
  create: 'Create',
  navigation: 'Navigation',
  actions: 'Actions',
  projects: 'Projects',
};

const CATEGORY_ORDER: CommandCategory[] = ['create', 'navigation', 'projects', 'actions'];

export function CommandBar({
  onClose,
  onCreateIssue,
  onOpenSettings,
  onOpenSearch,
  onAddProject,
}: {
  onClose: () => void;
  onCreateIssue: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onAddProject: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedIssueId = useSelectedIssueId();
  const deleteIssueMutation = useDeleteIssue();
  const { data: projects = [] } = useProjects();

  // Build commands list
  const commands = useMemo<CommandItem[]>(() => {
    const baseCommands: CommandItem[] = [
      // Create commands
      {
        id: 'create-issue',
        label: 'Create new issue',
        category: 'create',
        icon: <Plus size={16} />,
        shortcut: 'C',
        action: () => {
          onClose();
          onCreateIssue();
        },
        keywords: ['new', 'add', 'task', 'ticket'],
      },
      {
        id: 'create-project',
        label: 'Create new project',
        category: 'create',
        icon: <FolderPlus size={16} />,
        action: () => {
          onClose();
          onAddProject();
        },
        keywords: ['new', 'add', 'folder'],
      },

      // Navigation commands
      {
        id: 'nav-home',
        label: 'Go to Home',
        category: 'navigation',
        icon: <Home size={16} />,
        action: () => {
          setActiveView('view-inbox');
          onClose();
        },
        keywords: ['inbox', 'dashboard'],
      },
      {
        id: 'nav-my-issues',
        label: 'Go to My Issues',
        category: 'navigation',
        icon: <User size={16} />,
        action: () => {
          setActiveView('view-my-issues');
          onClose();
        },
        keywords: ['assigned', 'me'],
      },
      {
        id: 'nav-active',
        label: 'Go to Active',
        category: 'navigation',
        icon: <CircleDot size={16} />,
        action: () => {
          setActiveView('view-active');
          onClose();
        },
        keywords: ['in progress', 'working'],
      },
      {
        id: 'nav-backlog',
        label: 'Go to Backlog',
        category: 'navigation',
        icon: <Layers size={16} />,
        action: () => {
          setActiveView('view-backlog');
          onClose();
        },
        keywords: ['todo', 'planned'],
      },
      {
        id: 'search-issues',
        label: 'Search issues',
        category: 'navigation',
        icon: <Search size={16} />,
        shortcut: '/',
        action: () => {
          onClose();
          onOpenSearch();
        },
        keywords: ['find', 'filter'],
      },

      // Action commands
      {
        id: 'open-settings',
        label: 'Open Settings',
        category: 'actions',
        icon: <Settings size={16} />,
        action: () => {
          onClose();
          onOpenSettings();
        },
        keywords: ['preferences', 'config'],
      },
      {
        id: 'sign-out',
        label: 'Sign out',
        category: 'actions',
        icon: <LogOut size={16} />,
        action: async () => {
          onClose();
          await signOut();
          window.location.href = '/auth/sign-in';
        },
        keywords: ['logout', 'exit'],
        danger: true,
      },
    ];

    // Add project navigation commands
    const projectCommands: CommandItem[] = (projects as { id: string; name: string; color: string }[]).map((project) => ({
      id: `nav-project-${project.id}`,
      label: `Go to ${project.name}`,
      category: 'projects' as CommandCategory,
      icon: (
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            backgroundColor: project.color,
            display: 'inline-block',
          }}
        />
      ),
      action: () => {
        setActiveView(`project-${project.id}`);
        onClose();
      },
      keywords: ['project', project.name.toLowerCase()],
    }));

    // Add delete issue command if an issue is selected
    const contextCommands: CommandItem[] = [];
    if (selectedIssueId) {
      contextCommands.push({
        id: 'delete-issue',
        label: 'Delete current issue',
        category: 'actions',
        icon: <Trash2 size={16} />,
        action: () => {
          if (selectedIssueId && confirm('Are you sure you want to delete this issue?')) {
            deleteIssueMutation.mutate(selectedIssueId);
            setSelectedIssue(null);
          }
          onClose();
        },
        keywords: ['remove', 'trash'],
        danger: true,
      });
    }

    return [...baseCommands, ...projectCommands, ...contextCommands];
  }, [onClose, onCreateIssue, onOpenSettings, onOpenSearch, onAddProject, projects, selectedIssueId, deleteIssueMutation]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.includes(lowerQuery))
    );
  }, [commands, query]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<CommandCategory, CommandItem[]> = {
      create: [],
      navigation: [],
      projects: [],
      actions: [],
    };

    filteredCommands.forEach((cmd) => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    const result: CommandItem[] = [];
    CATEGORY_ORDER.forEach((category) => {
      result.push(...groupedCommands[category]);
    });
    return result;
  }, [groupedCommands]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatCommands.length]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && flatCommands.length > 0) {
      const selectedId = flatCommands[selectedIndex]?.id;
      if (selectedId) {
        const selectedElement = resultsRef.current.querySelector(`[data-command-id="${selectedId}"]`) as HTMLElement;
        if (selectedElement) {
          selectedElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [selectedIndex, flatCommands]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          flatCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const handleSelectCommand = (command: CommandItem) => {
    command.action();
  };

  // Calculate the flat index for a command
  const getFlatIndex = (command: CommandItem): number => {
    return flatCommands.findIndex((c) => c.id === command.id);
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
        {/* Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Command size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
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
            placeholder="Type a command or search..."
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

        {/* Commands */}
        <div
          ref={resultsRef}
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {flatCommands.length === 0 ? (
            <div
              style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
              }}
            >
              No commands found
            </div>
          ) : (
            CATEGORY_ORDER.map((category) => {
              const categoryCommands = groupedCommands[category];
              if (categoryCommands.length === 0) return null;

              return (
                <div key={category}>
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
                    {CATEGORY_LABELS[category]}
                  </div>
                  {categoryCommands.map((command) => (
                    <CommandItemRow
                      key={command.id}
                      command={command}
                      isSelected={getFlatIndex(command) === selectedIndex}
                      onClick={() => handleSelectCommand(command)}
                      onMouseEnter={() => setSelectedIndex(getFlatIndex(command))}
                    />
                  ))}
                </div>
              );
            })
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
              run
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {flatCommands.length} {flatCommands.length === 1 ? 'command' : 'commands'}
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandItemRow({
  command,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  command: CommandItem;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      data-command-id={command.id}
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
      {/* Icon */}
      <span
        style={{
          color: command.danger ? '#FF708C' : 'var(--color-text-muted)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {command.icon}
      </span>

      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: '13px',
          color: command.danger ? '#FF708C' : 'var(--color-text-primary)',
        }}
      >
        {command.label}
      </span>

      {/* Shortcut */}
      {command.shortcut && (
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
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}
