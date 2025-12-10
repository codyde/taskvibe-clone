// Server-side exports
// Note: Full server functions require additional TanStack Start configuration
// For now, we export the database client for direct use in API routes

export { db } from '../db';
export * from '../db/schema';
