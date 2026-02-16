/**
 * Playwright global setup
 * Runs once before all tests to ensure test users are active
 */

import { init } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  throw new Error(
    'Missing required environment variables: NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN'
  );
}

// Initialize the admin SDK
const adminDB = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

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

      // Get or create the user
      let user;
      try {
        user = await adminDB.auth.getUser({ email: testUser.email });
      } catch (error: any) {
        if (error?.message?.includes('not found') || error?.status === 404) {
          user = null;
        } else {
          throw error;
        }
      }

      if (user) {
        console.log(`   ✅ User exists (ID: ${user.id})`);
      } else {
        console.log(`   ℹ️  User not found, creating...`);
        const token = await adminDB.auth.createToken(testUser.email);
        user = await adminDB.auth.verifyToken(token);
        console.log(`   ✅ User created (ID: ${user.id})`);
      }

      // Activate the user in the $users table (only if user exists)
      if (user && user.id) {
        try {
          await adminDB.transact([
            adminDB.tx.$users[user.id].update({
              linkedGuestUsers: true,
              updatedAt: new Date(),
              lastSeenAt: new Date(),
            }),
          ]);
        } catch {
          // Ignore errors updating user - may not have permissions
        }
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
    const { groups } = await adminDB.query({
      groups: { $: { where: { id: 'e2e10001-0000-4000-8000-000000000001' } } },
    });

    if (groups && groups.length > 0) {
      console.log('   ✅ Base seed data already exists');
      return;
    }

    console.log('   ℹ️  Creating base seed data...');

    // Get the main test user
    let mainUser;
    try {
      mainUser = await adminDB.auth.getUser({ email: 'polity.live@gmail.com' });
    } catch {
      console.warn('   ⚠️  Main test user not found — skipping base seed');
      return;
    }

    const now = new Date().toISOString();

    // Create primary test group
    await adminDB.transact([
      adminDB.tx.groups['e2e10001-0000-4000-8000-000000000001'].update({
        name: 'Test Main Group',
        description: 'Primary test group for E2E tests',
        isPublic: true,
        visibility: 'public',
        memberCount: 1,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    // Link group to user
    await adminDB.transact([
      adminDB.tx.groups['e2e10001-0000-4000-8000-000000000001'].link({
        users: mainUser.id,
      }),
    ]);

    console.log('   ✅ Base seed data created');
  } catch (error) {
    console.warn('   ⚠️  Failed to create base seed data:', error);
    // Non-fatal — tests that need specific data should use factories
  }
}

export default globalSetup;
