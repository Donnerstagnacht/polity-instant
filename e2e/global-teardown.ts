/**
 * Playwright Global Teardown
 *
 * Runs after all tests complete. Cleans up orphaned test entities
 * (entities with e2e- prefix) that may have been left behind by
 * failed tests or tests that didn't clean up properly.
 *
 * This is a safety net — per-test factory cleanup handles most cases.
 */

import { init } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

async function globalTeardown() {
  if (!APP_ID || !ADMIN_TOKEN) {
    console.log('⏭️  Skipping global teardown — missing env vars');
    return;
  }

  console.log('\n🧹 Running global test teardown...\n');

  const adminDB = init({ appId: APP_ID, adminToken: ADMIN_TOKEN });

  // Clean up orphaned test users (e2e- prefix emails)
  try {
    const { $users } = await adminDB.query({ $users: {} });
    const orphanUsers = ($users || []).filter(
      (u: any) => u.email?.startsWith('e2e-') || u.handle?.startsWith('e2e-')
    );

    if (orphanUsers.length > 0) {
      console.log(`   🗑️ Cleaning ${orphanUsers.length} orphaned test users`);
      const batchSize = 20;
      for (let i = 0; i < orphanUsers.length; i += batchSize) {
        const batch = orphanUsers.slice(i, i + batchSize);
        await adminDB.transact(batch.map((u: any) => adminDB.tx.$users[u.id].delete()));
      }
    } else {
      console.log('   ✅ No orphaned test users found');
    }
  } catch (error) {
    console.warn('   ⚠️  Failed to clean up orphaned users:', error);
  }

  // Clean up orphaned test entities by name pattern
  const entityTables = ['groups', 'events', 'amendments', 'blogs', 'todos', 'conversations'];

  for (const table of entityTables) {
    try {
      const result = await adminDB.query({ [table]: {} });
      const entities = result[table] || [];
      const orphans = entities.filter(
        (e: any) =>
          e.name?.startsWith('E2E ') ||
          e.title?.startsWith('E2E ') ||
          e.name?.startsWith('e2e-') ||
          e.title?.startsWith('e2e-')
      );

      if (orphans.length > 0) {
        console.log(`   🗑️ Cleaning ${orphans.length} orphaned ${table}`);
        const batchSize = 20;
        for (let i = 0; i < orphans.length; i += batchSize) {
          const batch = orphans.slice(i, i + batchSize);
          await adminDB.transact(batch.map((e: any) => adminDB.tx[table][e.id].delete()));
        }
      }
    } catch {
      // Table may not exist or query may fail — skip silently
    }
  }

  console.log('   ✅ Global teardown complete\n');
}

export default globalTeardown;
