/**
 * Playwright Global Teardown
 *
 * Runs after all tests complete. Cleans up orphaned test entities
 * (entities with e2e- prefix) that may have been left behind by
 * failed tests or tests that didn't clean up properly.
 *
 * This is a safety net — per-test factory cleanup handles most cases.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function globalTeardown() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.log('⏭️  Skipping global teardown — missing env vars');
    return;
  }

  console.log('\n🧹 Running global test teardown...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Clean up orphaned test users (e2e- prefix emails/handles)
  try {
    const { data: users } = await supabase.from('user').select('id, email, handle');
    const orphanUsers = (users || []).filter(
      (u: any) => u.email?.startsWith('e2e-') || u.handle?.startsWith('e2e-')
    );

    if (orphanUsers.length > 0) {
      console.log(`   🗑️ Cleaning ${orphanUsers.length} orphaned test users`);
      const batchSize = 20;
      for (let i = 0; i < orphanUsers.length; i += batchSize) {
        const batch = orphanUsers.slice(i, i + batchSize);
        const ids = batch.map((u: any) => u.id);
        await supabase.from('user').delete().in('id', ids);

        // Also clean up auth users
        for (const u of batch) {
          await supabase.auth.admin.deleteUser(u.id).catch(() => {});
        }
      }
    } else {
      console.log('   ✅ No orphaned test users found');
    }
  } catch (error) {
    console.warn('   ⚠️  Failed to clean up orphaned users:', error);
  }

  // Clean up orphaned test entities by name pattern
  const entityTables = [
    { table: 'group', fields: ['name'] },
    { table: 'event', fields: ['title'] },
    { table: 'amendment', fields: ['title'] },
    { table: 'blog', fields: ['title'] },
    { table: 'todo', fields: ['title'] },
    { table: 'conversation', fields: ['name'] },
  ];

  for (const { table, fields } of entityTables) {
    try {
      const { data: entities } = await supabase.from(table).select(`id, ${fields.join(', ')}`);
      const orphans = (entities || []).filter((e: any) =>
        fields.some(
          f =>
            e[f]?.startsWith('E2E ') ||
            e[f]?.startsWith('e2e-')
        )
      );

      if (orphans.length > 0) {
        console.log(`   🗑️ Cleaning ${orphans.length} orphaned ${table} records`);
        const batchSize = 20;
        for (let i = 0; i < orphans.length; i += batchSize) {
          const batch = orphans.slice(i, i + batchSize);
          const ids = batch.map((e: any) => e.id);
          await supabase.from(table).delete().in('id', ids);
        }
      }
    } catch {
      // Table may not exist or query may fail — skip silently
    }
  }

  console.log('   ✅ Global teardown complete\n');
}

export default globalTeardown;
