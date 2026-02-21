/**
 * Supabase Admin Client for E2E Test Data Setup
 *
 * Provides a Supabase service_role client for E2E test data setup/teardown.
 * Uses the service_role key for full database access (bypasses RLS).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

let _client: SupabaseClient | null = null;

/**
 * Returns a cached Supabase admin client (service_role).
 */
export function createTestDb(): SupabaseClient {
  if (!_client) {
    const url =
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      'http://127.0.0.1:54321';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    _client = createClient(url, key);
  }
  return _client;
}
