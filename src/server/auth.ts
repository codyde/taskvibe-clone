import { createServerFn } from '@tanstack/react-start';

// Get current session - callable from client, runs on server
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const { auth } = await import('../lib/auth');
  const { getRequest } = await import('@tanstack/react-start/server');

  try {
    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });
    return session;
  } catch {
    return null;
  }
});
