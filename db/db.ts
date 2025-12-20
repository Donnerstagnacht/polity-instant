// db.ts
// Main database configuration and client setup for Instant
// This file initializes the Instant client and provides typed database access

import { init, tx, id } from '@instantdb/react';
import schema from './instant.schema';

// Initialize Instant client with app ID and schema
// Default to the configured APP_ID if environment variable is not set
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '869f3247-fd73-44fe-9b5f-caa541352f89';

// Create the database client
export const db = init({
  appId: APP_ID,
  schema,
});

// Export transaction and ID utilities
export { tx, id };

// Export default for easier imports
export default db;

// Type definitions for better TypeScript support
export type Database = typeof db;
export type Schema = typeof schema;
