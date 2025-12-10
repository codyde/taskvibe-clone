import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
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

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true for production
  },

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
  trustedOrigins: [process.env.VITE_APP_URL || 'http://localhost:3000'],

  // Plugins - tanstackStartCookies must be last
  plugins: [tanstackStartCookies()],
});

// Export type for client
export type Auth = typeof auth;
