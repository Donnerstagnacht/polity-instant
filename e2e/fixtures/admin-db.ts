/**
 * Admin SDK Singleton for E2E Tests
 *
 * Provides server-side database access for test setup/cleanup via InstantDB Admin SDK.
 * Lazy-initialized and cached for the lifetime of the test process.
 */

import { init, tx, id } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

let _db: ReturnType<typeof init> | null = null;

/**
 * Returns a cached InstantDB admin client.
 */
export function getAdminDb() {
  if (!_db) {
    const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
    const adminToken = process.env.INSTANT_ADMIN_TOKEN;
    if (!appId || !adminToken) {
      throw new Error(
        'Missing required environment variables: NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN'
      );
    }
    _db = init({ appId, adminToken });
  }
  return _db;
}

export { tx, id };

/**
 * Execute transactions in batches with retry on conflict.
 * Ported from scripts/helpers/transaction.helpers.ts for E2E use.
 */
export async function adminTransact(txns: any[], batchSize = 20): Promise<void> {
  const db = getAdminDb();
  for (let i = 0; i < txns.length; i += batchSize) {
    const batch = txns.slice(i, i + batchSize);
    let retries = 3;

    while (retries > 0) {
      try {
        await db.transact(batch);
        break;
      } catch (error: any) {
        if (error?.body?.type === 'record-not-unique' || error?.status === 409) {
          const backoff = (4 - retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoff));
          retries--;
        } else {
          throw error;
        }
      }
    }

    if (retries === 0) {
      throw new Error('Failed to execute batch after 3 retries');
    }
  }
}

/**
 * Query the database using the admin SDK.
 */
export async function adminQuery(query: Record<string, any>) {
  const db = getAdminDb();
  return db.query(query);
}
