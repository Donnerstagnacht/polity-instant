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
const TEST_USERS = [{ email: 'tobias.hassebrock@gmail.com' }];

async function globalSetup() {
  console.log('🔧 Running global test setup...\n');

  for (const testUser of TEST_USERS) {
    try {
      console.log(`📧 Setting up user: ${testUser.email}`);

      // Get or create the user
      let user;
      try {
        user = await adminDB.auth.getUser({ email: testUser.email });
        console.log(`   ✅ User exists (ID: ${user.id})`);
      } catch (error: any) {
        if (error?.message?.includes('not found') || error?.status === 404) {
          console.log(`   ℹ️  User not found, creating...`);
          const token = await adminDB.auth.createToken(testUser.email);
          user = await adminDB.auth.verifyToken(token);
          console.log(`   ✅ User created (ID: ${user.id})`);
        } else {
          throw error;
        }
      }

      // Activate the user in the $users table (only if user exists)
      if (user && user.id) {
        try {
          await adminDB.transact([
            adminDB.tx.$users[user.id].update({
              isActive: true,
              updatedAt: new Date(),
              lastSeenAt: new Date(),
            }),
          ]);
          console.log(`   ✅ User activated in $users table`);
        } catch {
          console.log(`   ℹ️  Could not update $users table (user record may not exist yet)`);
        }
      } else {
        console.log(`   ⚠️  User object is null or missing ID`);
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Failed to setup user ${testUser.email}:`, error);
      // Don't throw - continue with other users
    }
  }

  console.log('✅ Global test setup complete\n');
}

export default globalSetup;
