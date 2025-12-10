import { createMiddleware } from '@tanstack/react-start';

// Auth middleware for protecting server functions
export const authMiddleware = createMiddleware().server(
  async ({ next }) => {
    // Dynamic import to avoid bundling better-auth in client
    const { auth } = await import('./auth');
    const { getRequest } = await import('@tanstack/react-start/server');

    const request = getRequest();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      throw new Error('Unauthorized');
    }

    return next({ context: { user: session.user, session: session.session } });
  }
);
