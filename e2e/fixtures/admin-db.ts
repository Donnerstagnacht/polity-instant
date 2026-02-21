/**
 * Admin SDK Singleton for E2E Tests
 *
 * Provides server-side database access for test setup/cleanup via Supabase service_role client.
 * Lazy-initialized and cached for the lifetime of the test process.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

let _db: SupabaseClient | null = null;

/**
 * Returns a cached Supabase admin client (service_role).
 */
export function getAdminDb(): SupabaseClient {
  if (!_db) {
    const url =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      'http://127.0.0.1:54321';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
      );
    }

    _db = createClient(url, key);
  }
  return _db;
}

/**
 * Generate a new UUID suitable for entity creation.
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Upsert rows into a table with retry on transient errors.
 */
export async function adminUpsert(
  table: string,
  rows: Record<string, any> | Record<string, any>[]
): Promise<void> {
  const db = getAdminDb();
  const data = Array.isArray(rows) ? rows : [rows];
  const batchSize = 20;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    let retries = 5;

    while (retries > 0) {
      const { error } = await db.from(table).upsert(batch);
      if (!error) break;

      const isRetryable =
        error.code === '23505' || // unique constraint
        error.code === '40001' || // serialization failure
        error.code === '40P01' || // deadlock
        error.message?.includes('too many connections') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ECONNRESET');

      if (isRetryable) {
        const backoff = (6 - retries) * 1000;
        await new Promise(r => setTimeout(r, backoff));
        retries--;
      } else {
        throw new Error(`Supabase upsert error on "${table}": ${error.message}`);
      }
    }

    if (retries === 0) {
      throw new Error(`Failed to upsert into "${table}" after 5 retries`);
    }
  }
}

/**
 * Insert rows into a table (fails if row already exists).
 */
export async function adminInsert(
  table: string,
  rows: Record<string, any> | Record<string, any>[]
): Promise<void> {
  const db = getAdminDb();
  const data = Array.isArray(rows) ? rows : [rows];
  const { error } = await db.from(table).insert(data);
  if (error) {
    throw new Error(`Supabase insert error on "${table}": ${error.message}`);
  }
}

/**
 * Delete rows by IDs from a table.
 */
export async function adminDelete(table: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = getAdminDb();
  const batchSize = 20;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const { error } = await db.from(table).delete().in('id', batch);
    if (error) {
      // Ignore "not found" errors during cleanup
      if (!error.message?.includes('not found')) {
        console.warn(`Cleanup warning on "${table}": ${error.message}`);
      }
    }
  }
}

/**
 * Query all rows from a table.
 */
export async function adminQuery(table: string) {
  const db = getAdminDb();
  const { data, error } = await db.from(table).select('*');
  if (error) {
    throw new Error(`Supabase query error on "${table}": ${error.message}`);
  }
  return data ?? [];
}
