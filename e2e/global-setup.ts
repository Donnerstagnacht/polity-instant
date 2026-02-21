/**
 * Playwright global setup
 * Runs once before all tests to ensure test users are active
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test users to ensure are active
const TEST_USERS = [
  { email: 'polity.live@gmail.com' },
  { email: 'tobias-test@polity.app' },
];

async function globalSetup() {
  console.log('🔧 Running global test setup...\n');

  // Health check: verify the app is reachable
  try {
    const response = await fetch('http://localhost:3000');
    if (!response.ok) {
      console.warn('⚠️  App responded with non-OK status:', response.status);
    } else {
      console.log('✅ App is reachable at http://localhost:3000\n');
    }
  } catch {
    console.warn('⚠️  App at http://localhost:3000 is not reachable. Tests may fail.\n');
  }

  for (const testUser of TEST_USERS) {
    try {
      console.log(`📧 Setting up user: ${testUser.email}`);

      // Check if the user already exists in Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

      if (existingUser) {
        console.log(`   ✅ Auth user exists (ID: ${existingUser.id})`);

        // Ensure the profile row exists
        const { data: profile } = await supabase
          .from('user')
          .select('id')
          .eq('id', existingUser.id)
          .single();

        if (!profile) {
          console.log(`   ℹ️  Creating profile row...`);
          await supabase.from('user').upsert({
            id: existingUser.id,
            email: testUser.email,
            visibility: 'public',
            is_public: true,
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        console.log(`   ℹ️  User not found, creating...`);
        const { data: newAuth, error } = await supabase.auth.admin.createUser({
          email: testUser.email,
          email_confirm: true,
        });

        if (error) {
          console.error(`   ❌ Failed to create auth user: ${error.message}`);
          continue;
        }

        // Create profile row
        await supabase.from('user').upsert({
          id: newAuth.user.id,
          email: testUser.email,
          visibility: 'public',
          is_public: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        console.log(`   ✅ User created (ID: ${newAuth.user.id})`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to setup user ${testUser.email}:`, error);
      // Don't throw - continue with other users
    }
  }

  // Minimal base seed: ensure core shared entities exist
  await ensureBaseSeed();
}

/**
 * Ensures the core shared entities needed by most tests exist.
 * Uses deterministic IDs from test-entity-ids.ts so tests can reference them.
 * Only creates entities if they don't already exist (idempotent).
 */
async function ensureBaseSeed() {
  console.log('\n🌱 Ensuring base seed data...\n');

  try {
    // Check if the primary test group exists
    const { data: groups } = await supabase
      .from('group')
      .select('id')
      .eq('id', 'e2e10001-0000-4000-8000-000000000001');

    if (groups && groups.length > 0) {
      console.log('   ✅ Base seed data already exists');
      return;
    }

    console.log('   ℹ️  Creating base seed data...');

    // Get the main test user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const mainUser = existingUsers?.users?.find(u => u.email === 'polity.live@gmail.com');

    if (!mainUser) {
      console.warn('   ⚠️  Main test user not found — skipping base seed');
      return;
    }

    const now = new Date().toISOString();

    // Create primary test group
    await supabase.from('group').upsert({
      id: 'e2e10001-0000-4000-8000-000000000001',
      name: 'Test Main Group',
      description: 'Primary test group for E2E tests',
      is_public: true,
      visibility: 'public',
      member_count: 1,
      owner_id: mainUser.id,
      created_at: now,
      updated_at: now,
    });

    console.log('   ✅ Base seed data created');
  } catch (error) {
    console.warn('   ⚠️  Failed to create base seed data:', error);
    // Non-fatal — tests that need specific data should use factories
  }
}

export default globalSetup;
