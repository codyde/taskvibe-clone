import { useState, useEffect } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Sidebar } from '../components/Sidebar';
import { IssueList } from '../components/IssueList';
import { IssueDetail } from '../components/IssueDetail';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { SettingsModal } from '../components/SettingsModal';
import { SearchModal } from '../components/SearchModal';
import { CommandBar } from '../components/CommandBar';
import { AddProjectDialog } from '../components/AddProjectDialog';
import { useSelectedIssueId, setSelectedIssue } from '../store';
import { useWorkspaces, useCreateWorkspace, useCreateProject } from '../hooks';
import { getSession } from '../server/auth';

export const Route = createFileRoute('/app')({
  // Server-side auth check using server function
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: '/auth/sign-in',
        search: { redirect: location.href },
      });
    }
    
    return { user: session.user };
  },
  component: App,
});

function App() {
  const { user } = Route.useRouteContext();
  const { data: workspaces, isLoading: workspacesLoading, error: workspacesError } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCommandBar, setShowCommandBar] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const selectedIssueId = useSelectedIssueId();
  const createProjectMutation = useCreateProject();

  // Create default workspace if user has none
  useEffect(() => {
    if (user && !workspacesLoading && workspaces && workspaces.length === 0 && !createWorkspaceMutation.isPending) {
      createWorkspaceMutation.mutate({
        name: `${user.name || 'My'}'s Workspace`,
      });
    }
  }, [user, workspaces, workspacesLoading, createWorkspaceMutation.isPending]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K / Ctrl+K for command bar (works even in inputs)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandBar(true);
        return;
      }

      // Don't handle other shortcuts when in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowCreateModal(true);
      }

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowSearchModal(true);
      }

      if (e.key === 'Escape') {
        if (showCommandBar) {
          setShowCommandBar(false);
        } else if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showSettingsModal) {
          setShowSettingsModal(false);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showAddProject) {
          setShowAddProject(false);
        } else if (selectedIssueId) {
          setSelectedIssue(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal, showSettingsModal, showSearchModal, showCommandBar, showAddProject, selectedIssueId]);

  // Error state
  if (workspacesError) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--color-bg-primary)',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <span style={{ color: '#FF708C', fontSize: '16px', fontWeight: 500 }}>
          Error loading workspaces
        </span>
        <pre style={{ color: 'var(--color-text-secondary)', fontSize: '12px', maxWidth: '500px', overflow: 'auto' }}>
          {workspacesError instanceof Error ? workspacesError.message : String(workspacesError)}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading workspaces
  if (workspacesLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--color-bg-primary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Loading workspace...
          </span>
        </div>
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
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      <Sidebar
        onCreateIssue={() => setShowCreateModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSearch={() => setShowSearchModal(true)}
      />

      <main
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <IssueList />
        {selectedIssueId && <IssueDetail />}
      </main>

      {showCreateModal && <CreateIssueModal onClose={() => setShowCreateModal(false)} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}
      {showCommandBar && (
        <CommandBar
          onClose={() => setShowCommandBar(false)}
          onCreateIssue={() => setShowCreateModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenSearch={() => setShowSearchModal(true)}
          onAddProject={() => setShowAddProject(true)}
        />
      )}
      {showAddProject && (
        <AddProjectDialog
          isOpen={showAddProject}
          onClose={() => setShowAddProject(false)}
          onSave={(name, color) => {
            if (workspaces && workspaces[0]) {
              createProjectMutation.mutate({
                workspaceId: workspaces[0].id,
                name,
                color,
              });
            }
          }}
        />
      )}
    </div>
  );
}
