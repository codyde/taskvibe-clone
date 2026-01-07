import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { authClient } from '../../lib/auth-client';

export const Route = createFileRoute('/auth/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSentrySignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await authClient.signIn.oauth2({
        providerId: 'sentry',
        callbackURL: '/app',
      });
    } catch (err) {
      console.error('Sign in error:', err);
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
            Welcome to TaskVibe
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            Sign in with your Sentry account
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

        <button
          onClick={handleSentrySignIn}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            backgroundColor: loading ? 'var(--color-bg-tertiary)' : '#362d59',
            color: loading ? 'var(--color-text-muted)' : 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 72 66"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M29,2.26a4.67,4.67,0,0,0-8,0L14.42,13.53A32.21,32.21,0,0,1,32.17,40.19H27.55A27.68,27.68,0,0,0,12.09,17.47L6,28a15.92,15.92,0,0,1,9.23,12.17H4.62A.76.76,0,0,1,4,39.06l2.94-5a10.74,10.74,0,0,0-3.36-1.9l-2.91,5a4.54,4.54,0,0,0,1.69,6.24A4.66,4.66,0,0,0,4.62,44H19.15a19.4,19.4,0,0,0-8-17.31l2.31-4A23.87,23.87,0,0,1,23.76,44H36.07a35.88,35.88,0,0,0-16.41-31.8l4.67-8a.77.77,0,0,1,1.05-.27c.53.29,20.29,34.77,20.66,35.17a.76.76,0,0,1-.68,1.13H40.6q.09,1.91,0,3.81h4.78A4.59,4.59,0,0,0,50,39.43a4.49,4.49,0,0,0-.62-2.28Z" />
          </svg>
          {loading ? 'Redirecting...' : 'Continue with Sentry'}
        </button>
      </div>
    </div>
  );
}
