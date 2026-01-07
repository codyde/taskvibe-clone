import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { genericOAuth } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  // Base URL for the auth server
  baseURL: process.env.VITE_APP_URL || 'http://localhost:3000',

  // Database adapter
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Trusted origins
  trustedOrigins: ['http://localhost:3000', process.env.VITE_APP_URL].filter(Boolean) as string[],

  // Plugins - tanstackStartCookies must be last
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: 'sentry',
          clientId: process.env.SENTRY_CLIENT_ID!,
          clientSecret: process.env.SENTRY_CLIENT_SECRET!,
          authorizationUrl: 'https://sentry.io/oauth/authorize/',
          tokenUrl: 'https://sentry.io/oauth/token/',
          scopes: ['openid', 'profile', 'email'],
          pkce: true,
          getUserInfo: async (tokens) => {
            const raw = tokens.raw as Record<string, unknown>;
            const user = raw.user as { id: string; name: string; email: string };
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: true,
            };
          },
        },
      ],
    }),
    tanstackStartCookies(),
  ],
});

// Export type for client
export type Auth = typeof auth;
