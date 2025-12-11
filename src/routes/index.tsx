import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Circle,
  CircleDot,
  CircleDashed,
  CircleCheck,
  CircleX,
  Signal,
  AlertTriangle,
  Minus,
  Plus,
  Search,
  Home,
  Inbox,
  Layers,
  ChevronDown,
  Zap,
  GitBranch,
  Terminal,
  Coffee,
  Keyboard,
  Rocket,
  X,
  Calendar,
  User,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

// App name - change this to your preferred name
const APP_NAME = 'Momentum';

function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 48px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={18} color="white" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700 }}>{APP_NAME}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/auth/sign-in"
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '64px',
          padding: '80px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
          alignItems: 'center',
        }}
      >
        {/* Left side - Copy */}
        <div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 50%, var(--color-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ship faster.
            <br />
            Break less.
            <br />
            Sleep more.
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.7,
              marginBottom: '32px',
            }}
          >
            The tracker that doesn't suck. Built for developers who'd rather
            be coding than updating tickets. Keyboard-first, blazingly fast,
            and actually enjoyable to use.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              to="/auth/sign-up"
              style={{
                padding: '14px 28px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(157, 88, 191, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Rocket size={18} />
              Get Started — it's free
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 28px',
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid var(--color-border)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              }}
            >
              <GitBranch size={18} />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Right side - Static Mocked UI */}
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          <StaticMockedUI />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section
        style={{
          padding: '80px 48px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: '40px',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '16px',
            }}
          >
            Built different. On purpose.
          </h2>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto 48px',
            }}
          >
            Don't take our word for it. Try it yourself — click around, create tasks,
            change statuses. This is exactly how it feels.
          </p>

          {/* Interactive Demo */}
          <div
            style={{
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
              backgroundColor: 'var(--color-bg-primary)',
              marginBottom: '64px',
            }}
          >
            <InteractiveDemo />
          </div>

          {/* Feature Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
            }}
          >
            <FeatureCard
              icon={<Keyboard size={24} />}
              title="Keyboard-first"
              description="Your mouse is for gaming, not for clicking through 47 nested menus. Every action has a shortcut. Press C to create, / to search, K to command."
            />
            <FeatureCard
              icon={<Zap size={24} />}
              title="Actually fast"
              description="Not 'fast for an Electron app' fast. Actually fast. Like, the kind of fast that makes you question if it even hit the database."
            />
            <FeatureCard
              icon={<Terminal size={24} />}
              title="Developer vibes"
              description="Dark mode that doesn't burn your retinas at 2am. Monospace fonts where they belong. No cartoon animals or motivational quotes."
            />
            <FeatureCard
              icon={<Coffee size={24} />}
              title="No bloat"
              description="We didn't add features just because the PM said 'wouldn't it be cool if...'. Every feature earns its place by being useful."
            />
            <FeatureCard
              icon={<GitBranch size={24} />}
              title="Git-aware"
              description="Automatically links commits, PRs, and branches. Because copy-pasting IDs into commit messages is so 2015."
            />
            <FeatureCard
              icon={<Rocket size={24} />}
              title="Ship faster"
              description="Less time managing tasks means more time solving actual problems. Revolutionary concept, we know."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '32px 48px',
          borderTop: '1px solid var(--color-border)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
        }}
      >
        <p>Built with ☕ and questionable amounts of caffeine.</p>
        <p style={{ marginTop: '8px' }}>
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: '32px',
        backgroundColor: 'var(--color-bg-tertiary)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--color-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--color-border)';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: 'var(--color-bg-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          marginBottom: '20px',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '12px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}

// Static mocked UI for the hero section
function StaticMockedUI() {
  const mockIssues = [
    { id: 'MOM-142', status: 'in_progress', priority: 'high', title: 'Implement dark mode toggle' },
    { id: 'MOM-141', status: 'todo', priority: 'medium', title: 'Add keyboard shortcuts documentation' },
    { id: 'MOM-140', status: 'in_progress', priority: 'urgent', title: 'Fix authentication edge case' },
    { id: 'MOM-139', status: 'done', priority: 'low', title: 'Update onboarding flow copy' },
    { id: 'MOM-138', status: 'todo', priority: 'none', title: 'Research caching strategies' },
  ];

  return (
    <div style={{ display: 'flex', height: '400px' }}>
      {/* Mock Sidebar */}
      <div
        style={{
          width: '200px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          padding: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              fontSize: '10px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            A
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>Acme Inc</span>
          <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
        </div>

        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            width: '100%',
            padding: '8px 10px',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            fontWeight: 500,
            marginBottom: '12px',
          }}
        >
          <Plus size={14} />
          New Task
        </button>

        <div style={{ marginBottom: '16px' }}>
          <MockNavItem icon={<Search size={14} />} label="Search" shortcut="/" />
          <MockNavItem icon={<Home size={14} />} label="Home" active />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-muted)',
              padding: '0 8px',
            }}
          >
            Views
          </span>
        </div>
        <MockNavItem icon={<Inbox size={14} />} label="Inbox" />
        <MockNavItem icon={<Layers size={14} />} label="Active" />
      </div>

      {/* Mock Issue List */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-bg-primary)', overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>All Tasks</span>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-bg-tertiary)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              5
            </span>
          </div>
        </div>

        <div>
          {mockIssues.map((issue, index) => (
            <StaticIssueRow key={issue.id} issue={issue} isSelected={index === 2} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StaticIssueRow({ issue, isSelected }: { issue: any; isSelected: boolean }) {
  const STATUS_ICONS: Record<string, React.ReactNode> = {
    backlog: <CircleDashed size={12} style={{ color: '#6b6478' }} />,
    todo: <Circle size={12} style={{ color: '#a099ad' }} />,
    in_progress: <CircleDot size={12} style={{ color: '#FF9838' }} />,
    done: <CircleCheck size={12} style={{ color: '#22c55e' }} />,
  };

  const PRIORITY_ICONS: Record<string, React.ReactNode> = {
    urgent: <AlertTriangle size={12} style={{ color: '#FF708C' }} />,
    high: <Signal size={12} style={{ color: '#FF9838' }} />,
    medium: <Signal size={12} style={{ color: '#9D58BF' }} />,
    low: <Signal size={12} style={{ color: '#6b6478' }} />,
    none: <Minus size={12} style={{ color: '#4a4260' }} />,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 20px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: isSelected ? 'var(--color-bg-active)' : 'transparent',
        borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
      }}
    >
      {PRIORITY_ICONS[issue.priority]}
      <span
        style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          minWidth: '55px',
        }}
      >
        {issue.id}
      </span>
      {STATUS_ICONS[issue.status]}
      <span
        style={{
          fontSize: '12px',
          color: 'var(--color-text-primary)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {issue.title}
      </span>
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          fontSize: '8px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
        }}
      >
        JD
      </div>
    </div>
  );
}

function MockNavItem({
  icon,
  label,
  shortcut,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: '6px',
        backgroundColor: active ? 'var(--color-bg-active)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontSize: '12px',
        marginBottom: '2px',
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && (
        <span
          style={{
            fontSize: '10px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '1px 5px',
            borderRadius: '3px',
          }}
        >
          {shortcut}
        </span>
      )}
    </div>
  );
}

// Interactive Demo Component
type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled';
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

interface DemoTask {
  id: string;
  identifier: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string | null;
  labels: { name: string; color: string }[];
}

const INITIAL_TASKS: DemoTask[] = [
  {
    id: '1',
    identifier: 'MOM-101',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment. Include staging and production environments.',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Sarah Chen',
    dueDate: '2024-12-15',
    labels: [{ name: 'devops', color: '#FF9838' }],
  },
  {
    id: '2',
    identifier: 'MOM-102',
    title: 'Implement user authentication',
    description: 'Add OAuth support for Google and GitHub. Include session management and secure token handling.',
    status: 'todo',
    priority: 'urgent',
    assignee: 'Alex Rivera',
    dueDate: '2024-12-12',
    labels: [{ name: 'security', color: '#FF708C' }, { name: 'backend', color: '#9D58BF' }],
  },
  {
    id: '3',
    identifier: 'MOM-103',
    title: 'Design system documentation',
    description: 'Document all component props, usage examples, and design tokens for the team.',
    status: 'in_review',
    priority: 'medium',
    assignee: 'Jordan Kim',
    dueDate: null,
    labels: [{ name: 'docs', color: '#22c55e' }],
  },
  {
    id: '4',
    identifier: 'MOM-104',
    title: 'Optimize database queries',
    description: 'Profile and optimize slow queries. Add proper indexing and consider query caching.',
    status: 'backlog',
    priority: 'low',
    assignee: null,
    dueDate: null,
    labels: [{ name: 'performance', color: '#FF9838' }, { name: 'backend', color: '#9D58BF' }],
  },
  {
    id: '5',
    identifier: 'MOM-105',
    title: 'Add keyboard shortcuts',
    description: 'Implement vim-style navigation and common action shortcuts throughout the app.',
    status: 'done',
    priority: 'medium',
    assignee: 'Sarah Chen',
    dueDate: '2024-12-10',
    labels: [{ name: 'ux', color: '#9D58BF' }],
  },
  {
    id: '6',
    identifier: 'MOM-106',
    title: 'Mobile responsive layout',
    description: 'Ensure all views work well on tablet and mobile devices.',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    dueDate: '2024-12-20',
    labels: [{ name: 'frontend', color: '#9D58BF' }],
  },
];

function InteractiveDemo() {
  const [tasks, setTasks] = useState<DemoTask[]>(INITIAL_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskCounter, setTaskCounter] = useState(INITIAL_TASKS.length);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.identifier.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeView === 'active') {
      return ['todo', 'in_progress', 'in_review'].includes(task.status);
    }
    if (activeView === 'backlog') {
      return task.status === 'backlog';
    }
    if (activeView === 'done') {
      return task.status === 'done';
    }
    return task.status !== 'cancelled';
  });

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const updateTaskPriority = (taskId: string, newPriority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
  };

  const startCreating = () => {
    setIsCreating(true);
    setNewTaskTitle('');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setNewTaskTitle('');
  };

  const submitNewTask = () => {
    if (newTaskTitle.trim()) {
      const newCount = taskCounter + 1;
      const newId = String(Date.now());
      const newIdentifier = `MOM-${100 + newCount}`;
      setTasks((prev) => [
        {
          id: newId,
          identifier: newIdentifier,
          title: newTaskTitle.trim(),
          description: '',
          status: 'todo',
          priority: 'none',
          assignee: null,
          dueDate: null,
          labels: [],
        },
        ...prev,
      ]);
      setTaskCounter(newCount);
    }
    setIsCreating(false);
    setNewTaskTitle('');
  };

  const handleNewTaskKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitNewTask();
    } else if (e.key === 'Escape') {
      cancelCreating();
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTaskId(null);
  };

  return (
    <div style={{ display: 'flex', height: '500px' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '220px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              fontSize: '12px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
            }}
          >
            D
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, flex: 1 }}>Demo Workspace</span>
        </div>

        <button
          onClick={startCreating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 12px',
            backgroundColor: 'var(--color-primary)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: '16px',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={16} />
          New Task
        </button>

        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: '6px',
            marginBottom: '16px',
          }}
        >
          <Search size={14} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
            }}
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--color-text-muted)',
              padding: '0 8px',
            }}
          >
            Views
          </span>
        </div>
        <DemoNavItem
          icon={<Inbox size={15} />}
          label="All Tasks"
          count={tasks.filter((t) => t.status !== 'cancelled').length}
          active={activeView === 'all'}
          onClick={() => setActiveView('all')}
        />
        <DemoNavItem
          icon={<CircleDot size={15} />}
          label="Active"
          count={tasks.filter((t) => ['todo', 'in_progress', 'in_review'].includes(t.status)).length}
          active={activeView === 'active'}
          onClick={() => setActiveView('active')}
        />
        <DemoNavItem
          icon={<CircleDashed size={15} />}
          label="Backlog"
          count={tasks.filter((t) => t.status === 'backlog').length}
          active={activeView === 'backlog'}
          onClick={() => setActiveView('backlog')}
        />
        <DemoNavItem
          icon={<CircleCheck size={15} />}
          label="Done"
          count={tasks.filter((t) => t.status === 'done').length}
          active={activeView === 'done'}
          onClick={() => setActiveView('done')}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Task List */}
        <div
          style={{
            flex: 1,
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column',
            borderRight: selectedTask ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600 }}>
              {activeView === 'all' && 'All Tasks'}
              {activeView === 'active' && 'Active'}
              {activeView === 'backlog' && 'Backlog'}
              {activeView === 'done' && 'Done'}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-bg-tertiary)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {filteredTasks.length}
            </span>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {/* Inline create row */}
            {isCreating && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 20px',
                  backgroundColor: 'var(--color-bg-hover)',
                  borderLeft: '2px solid var(--color-primary)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <Minus size={14} style={{ color: '#4a4260', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-text-muted)',
                    minWidth: '65px',
                  }}
                >
                  MOM-{100 + taskCounter + 1}
                </span>
                <Circle size={14} style={{ color: '#a099ad', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Task title... (Enter to save, Esc to cancel)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleNewTaskKeyDown}
                  onBlur={submitNewTask}
                  autoFocus
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
            )}

            {filteredTasks.length === 0 && !isCreating ? (
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
                <p style={{ fontSize: '14px' }}>No tasks found</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  Try a different filter or create a new task
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <DemoTaskRow
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => setSelectedTaskId(task.id)}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                />
              ))
            )}
          </div>
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <DemoTaskDetail
            task={selectedTask}
            onClose={() => setSelectedTaskId(null)}
            onStatusChange={(status) => updateTaskStatus(selectedTask.id, status)}
            onPriorityChange={(priority) => updateTaskPriority(selectedTask.id, priority)}
            onDelete={() => deleteTask(selectedTask.id)}
          />
        )}
      </div>
    </div>
  );
}

function DemoNavItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
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
        padding: '8px 10px',
        borderRadius: '6px',
        backgroundColor: active ? 'var(--color-bg-active)' : 'transparent',
        color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        fontSize: '13px',
        marginBottom: '2px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {count !== undefined && (
        <span
          style={{
            fontSize: '11px',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '1px 6px',
            borderRadius: '4px',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function DemoTaskRow({
  task,
  isSelected,
  onSelect,
  onStatusChange,
}: {
  task: DemoTask;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (status: TaskStatus) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const STATUS_CONFIG: Record<TaskStatus, { icon: React.ReactNode; color: string }> = {
    backlog: { icon: <CircleDashed size={14} />, color: '#6b6478' },
    todo: { icon: <Circle size={14} />, color: '#a099ad' },
    in_progress: { icon: <CircleDot size={14} />, color: '#FF9838' },
    in_review: { icon: <CircleDot size={14} />, color: '#9D58BF' },
    done: { icon: <CircleCheck size={14} />, color: '#22c55e' },
    cancelled: { icon: <CircleX size={14} />, color: '#6b6478' },
  };

  const PRIORITY_ICONS: Record<TaskPriority, React.ReactNode> = {
    urgent: <AlertTriangle size={14} style={{ color: '#FF708C' }} />,
    high: <Signal size={14} style={{ color: '#FF9838' }} />,
    medium: <Signal size={14} style={{ color: '#9D58BF' }} />,
    low: <Signal size={14} style={{ color: '#6b6478' }} />,
    none: <Minus size={14} style={{ color: '#4a4260' }} />,
  };

  const statusConfig = STATUS_CONFIG[task.status];

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        backgroundColor: isSelected ? 'var(--color-bg-active)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color var(--transition-fast)',
        borderLeft: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
        borderBottom: '1px solid var(--color-border)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {PRIORITY_ICONS[task.priority]}

      <span
        style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          minWidth: '65px',
        }}
      >
        {task.identifier}
      </span>

      {/* Clickable status */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowStatusMenu(!showStatusMenu);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
            color: statusConfig.color,
          }}
          title="Change status"
        >
          {statusConfig.icon}
        </button>

        {showStatusMenu && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '4px',
              zIndex: 100,
              minWidth: '140px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status);
                  setShowStatusMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: task.status === status ? 'var(--color-bg-active)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: STATUS_CONFIG[status].color,
                  fontSize: '12px',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (task.status !== status) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                }}
                onMouseLeave={(e) => {
                  if (task.status !== status) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {STATUS_CONFIG[status].icon}
                <span style={{ textTransform: 'capitalize' }}>
                  {status.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

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
        {task.title}
      </span>

      {task.labels.slice(0, 2).map((label) => (
        <span
          key={label.name}
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

      {task.assignee ? (
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 600,
            color: 'white',
          }}
          title={task.assignee}
        >
          {task.assignee
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </div>
      ) : (
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            border: '1px dashed var(--color-border-light)',
          }}
          title="Unassigned"
        />
      )}
    </div>
  );
}

function DemoTaskDetail({
  task,
  onClose,
  onStatusChange,
  onPriorityChange,
  onDelete,
}: {
  task: DemoTask;
  onClose: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority) => void;
  onDelete: () => void;
}) {
  const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
    { value: 'backlog', label: 'Backlog' },
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'urgent', label: 'Urgent', color: '#FF708C' },
    { value: 'high', label: 'High', color: '#FF9838' },
    { value: 'medium', label: 'Medium', color: '#9D58BF' },
    { value: 'low', label: 'Low', color: '#6b6478' },
    { value: 'none', label: 'None', color: '#4a4260' },
  ];

  return (
    <div
      style={{
        width: '360px',
        backgroundColor: 'var(--color-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
          }}
        >
          {task.identifier}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          {task.title}
        </h2>

        {task.description && (
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            {task.description}
          </p>
        )}

        {/* Properties */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Status
            </label>
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Priority
            </label>
            <select
              value={task.priority}
              onChange={(e) => onPriorityChange(e.target.value as TaskPriority)}
              style={{
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--color-text-muted)',
                marginBottom: '6px',
              }}
            >
              Assignee
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
              }}
            >
              {task.assignee ? (
                <>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
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
                    {task.assignee
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <span style={{ fontSize: '13px' }}>{task.assignee}</span>
                </>
              ) : (
                <>
                  <User size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Unassigned
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  marginBottom: '6px',
                }}
              >
                Due Date
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}

          {/* Labels */}
          {task.labels.length > 0 && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  marginBottom: '6px',
                }}
              >
                Labels
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {task.labels.map((label) => (
                  <span
                    key={label.name}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={onDelete}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 112, 140, 0.3)',
            borderRadius: '6px',
            color: '#FF708C',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 112, 140, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}

