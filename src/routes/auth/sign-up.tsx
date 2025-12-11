import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { signUp } from '../../lib/auth-client';

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Sign up failed');
        setLoading(false);
      } else {
        // Force a full page navigation to ensure session is picked up
        // The workspace will be created via the app route's loader
        window.location.href = '/app';
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-primary)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '32px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
            }}
          >
            Create an account
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Get started with your issue tracker
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(255, 112, 140, 0.1)',
              border: '1px solid rgba(255, 112, 140, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#FF708C',
              fontSize: '13px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              placeholder="John Doe"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                transition: 'border-color var(--transition-fast)',
              }}
              placeholder="••••••••"
            />
            <p
              style={{
                marginTop: '6px',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
              }}
            >
              Must be at least 8 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: loading ? 'var(--color-bg-tertiary)' : 'var(--color-primary)',
              color: loading ? 'var(--color-text-muted)' : 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/auth/sign-in"
            style={{
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
