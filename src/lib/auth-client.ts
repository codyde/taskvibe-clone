import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
});

// Export hooks and methods
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
