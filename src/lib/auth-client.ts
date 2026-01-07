import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_APP_URL || 'http://localhost:3000',
  plugins: [genericOAuthClient()],
});

// Export hooks and methods
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
