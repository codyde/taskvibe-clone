import {
  Inbox,
  User,
  CircleDot,
  Layers,
  ChevronDown,
  Plus,
  Search,
  Settings,
  FolderKanban,
  Home,
} from 'lucide-react'
import { useViews, useProjects, useActiveView, setActiveView, useCurrentUser } from '../store'

const ICON_MAP: Record<string, React.ReactNode> = {
  inbox: <Inbox size={16} />,
  user: <User size={16} />,
  'circle-dot': <CircleDot size={16} />,
  layers: <Layers size={16} />,
}

export function Sidebar({ onCreateIssue }: { onCreateIssue: () => void }) {
  const views = useViews()
  const projects = useProjects()
  const activeView = useActiveView()
  const currentUser = useCurrentUser()

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
        style={{
          padding: '12px 12px 8px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '12px',
              color: 'white',
            }}
          >
            A
          </div>
          <span
            style={{
              flex: 1,
              textAlign: 'left',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
            }}
          >
            Acme Inc
          </span>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
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
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
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
          <NavItem
            icon={<Search size={16} />}
            label="Search"
            shortcut="/"
            onClick={() => {}}
          />
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
          <SectionHeader title="Projects" />
          <div style={{ padding: '0 8px' }}>
            {projects.map((project) => (
              <NavItem
                key={project.id}
                icon={
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '2px',
                      backgroundColor: project.color,
                    }}
                  />
                }
                label={project.name}
                onClick={() => setActiveView(`project-${project.id}`)}
                active={activeView === `project-${project.id}`}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* User section */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            transition: 'background-color var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
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
            {currentUser.initials}
          </div>
          <span
            style={{
              flex: 1,
              textAlign: 'left',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
            }}
          >
            {currentUser.name}
          </span>
          <Settings size={14} style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>
    </aside>
  )
}

function SectionHeader({ title }: { title: string }) {
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
      <button
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
        }}
      >
        <Plus size={12} />
      </button>
    </div>
  )
}

function NavItem({
  icon,
  label,
  shortcut,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  shortcut?: string
  active?: boolean
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
          e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent'
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
  )
}
