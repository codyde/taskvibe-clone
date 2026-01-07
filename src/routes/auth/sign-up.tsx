import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  // With Sentry OAuth, sign-up happens automatically on first login
  // Redirect to sign-in page
  return <Navigate to="/auth/sign-in" />;
}
