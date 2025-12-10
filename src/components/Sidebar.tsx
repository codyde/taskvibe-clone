import { useState, useRef, useEffect } from 'react';
import {
  Inbox,
  User,
  CircleDot,
  Layers,
  ChevronDown,
  Plus,
  Search,
  Settings,
  Home,
  Pencil,
  LogOut,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useViews, useActiveView, setActiveView } from '../store';
import { useProjects, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useSession, signOut } from '../lib/auth-client';
import { ProjectEditDialog } from './ProjectEditDialog';
import { AddProjectDialog } from './AddProjectDialog';
import type { Project } from '../db/schema';

const ICON_MAP: Record<string, React.ReactNode> = {
  inbox: <Inbox size={16} />,
  user: <User size={16} />,
  'circle-dot': <CircleDot size={16} />,
  layers: <Layers size={16} />,
};

export function Sidebar({
  onCreateIssue,
  onOpenSettings,
}: {
  onCreateIssue: () => void;
  onOpenSettings: () => void;
}) {
  const navigate = useNavigate();
  const views = useViews();
  const { data: projects = [] } = useProjects();
  const { data: workspaces = [] } = useWorkspaces();
  const { data: session } = useSession();
  const activeView = useActiveView();
  
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const currentWorkspace = workspaces[0];
  const currentUser = session?.user;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWorkspaceMenu(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showWorkspaceMenu || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWorkspaceMenu, showUserMenu]);

  const handleSignOut = async () => {
    await signOut();
    // Full page redirect to ensure session is cleared
    window.location.href = '/auth/sign-in';
  };

  const handleCreateProject = (name: string, color?: string) => {
    if (currentWorkspace) {
      createProjectMutation.mutate({
        workspaceId: currentWorkspace.id,
        name,
        color,
      });
    }
  };

  const handleUpdateProject = (name: string) => {
    if (editingProject) {
      updateProjectMutation.mutate({
        projectId: editingProject.id,
        name,
      });
    }
  };

  return (
    <aside
      style={{
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Workspace header */}
      <div
        ref={dropdownRef}
        style={{
          padding: '12px 12px 8px',
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px',
            backgroundColor: showWorkspaceMenu ? 'var(--color-bg-hover)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!showWorkspaceMenu) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              background: currentWorkspace?.icon
                ? `url(${currentWorkspace.icon}) center/cover no-repeat`
                : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '12px',
              color: 'white',
              overflow: 'hidden',
            }}
          >
            {!currentWorkspace?.icon && (currentWorkspace?.name || 'W').charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              flex: 1,
              textAlign: 'left',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            {currentWorkspace?.name || 'Workspace'}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-muted)',
              transform: showWorkspaceMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </button>

        {/* Dropdown Menu */}
        {showWorkspaceMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '12px',
              right: '12px',
              marginTop: '4px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              zIndex: 50,
              overflow: 'hidden',
            }}
            className="animate-slide-in"
          >
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                onOpenSettings();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Settings size={15} />
              <span>Workspace Settings</span>
            </button>
            <button
              onClick={() => {
                setShowWorkspaceMenu(false);
                handleSignOut();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                borderTop: '1px solid var(--color-border)',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.color = '#FF708C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Search and create */}
      <div style={{ padding: '8px 12px' }}>
        <button
          onClick={onCreateIssue}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            color: 'white',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <Plus size={16} />
          <span>New Issue</span>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {/* Main views */}
        <div style={{ padding: '0 8px' }}>
          <NavItem icon={<Search size={16} />} label="Search" shortcut="/" onClick={() => {}} />
          <NavItem
            icon={<Home size={16} />}
            label="Home"
            active={activeView === 'view-inbox'}
            onClick={() => setActiveView('view-inbox')}
          />
        </div>

        {/* Views section */}
        <div style={{ marginTop: '16px' }}>
          <SectionHeader title="Views" />
          <div style={{ padding: '0 8px' }}>
            {views.map((view) => (
              <NavItem
                key={view.id}
                icon={ICON_MAP[view.icon] || <CircleDot size={16} />}
                label={view.name}
                active={activeView === view.id}
                onClick={() => setActiveView(view.id)}
              />
            ))}
          </div>
        </div>

        {/* Projects section */}
        <div style={{ marginTop: '16px' }}>
          <SectionHeader title="Projects" onAdd={() => setShowAddProject(true)} />
          <div style={{ padding: '0 8px' }}>
            {projects.map((project: Project) => (
              <ProjectNavItem
                key={project.id}
                project={project}
                active={activeView === `project-${project.id}`}
                onClick={() => setActiveView(`project-${project.id}`)}
                onEdit={() => setEditingProject(project)}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div
        ref={userDropdownRef}
        style={{
          padding: '12px',
          borderTop: '1px solid var(--color-border)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px',
            backgroundColor: showUserMenu ? 'var(--color-bg-hover)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!showUserMenu) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 600,
              color: 'white',
            }}
          >
            {currentUser?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'U'}
          </div>
          <span
            style={{
              flex: 1,
              textAlign: 'left',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
            }}
          >
            {currentUser?.name || 'User'}
          </span>
          <ChevronDown
            size={14}
            style={{
              color: 'var(--color-text-muted)',
              transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform var(--transition-fast)',
            }}
          />
        </button>

        {/* User dropdown menu (opens upward) */}
        {showUserMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              right: '12px',
              marginBottom: '4px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.35)',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {currentUser?.name || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {currentUser?.email || ''}
              </div>
            </div>
            <button
              onClick={() => {
                setShowUserMenu(false);
                handleSignOut();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                e.currentTarget.style.color = '#FF708C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      {/* Project Edit Dialog */}
      <ProjectEditDialog
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdateProject}
        currentName={editingProject?.name || ''}
      />

      {/* Add Project Dialog */}
      <AddProjectDialog
        isOpen={showAddProject}
        onClose={() => setShowAddProject(false)}
        onSave={handleCreateProject}
      />
    </aside>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div
      style={{
        padding: '4px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--color-text-muted)',
        }}
      >
        {title}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          style={{
            background: 'none',
            border: 'none',
            padding: '2px',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <Plus size={12} />
        </button>
      )}
    </div>
  );
}

function ProjectNavItem({
  project,
  active,
  onClick,
  onEdit,
}: {
  project: Project;
  active?: boolean;
  onClick: () => void;
  onEdit: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          padding: '6px 8px',
          paddingRight: isHovered ? '32px' : '8px',
          backgroundColor: active ? 'var(--color-bg-active)' : 'transparent',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'background-color var(--transition-fast)',
          color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: project.color,
            }}
          />
        </span>
        <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>{project.name}</span>
      </button>
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={{
            position: 'absolute',
            right: '8px',
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
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <Pencil size={12} />
        </button>
      )}
    </div>
  );
}

function NavItem({
  icon,
  label,
  shortcut,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        padding: '6px 8px',
        backgroundColor: active ? 'var(--color-bg-active)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>{label}</span>
      {shortcut && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}
