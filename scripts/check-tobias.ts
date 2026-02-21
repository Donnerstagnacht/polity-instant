import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const db = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function testDirectLink() {
  console.log('=== Direct Link Test ===\n');

  // Step 1: Get a group with its roles
  const { data: groups } = await db.from('groups').select('*').limit(1);
  const group = groups?.[0] as any;
  console.log('Group:', group?.name);

  if (group) {
    const { data: roles } = await db.from('roles').select('*').eq('groupId', group.id);
    console.log('Group roles:', roles?.length || 0);
    if (roles && roles.length > 0) {
      console.log('  First role:', roles[0]);
    }
  }

  // Check existing group memberships
  const { data: allMemberships } = await db.from('groupMemberships').select('*').limit(3);

  console.log('\n--- Existing memberships ---');
  console.log('Count:', allMemberships?.length);
  for (const m of (allMemberships || []) as any[]) {
    console.log('  Membership:', m.id);
    console.log('    status:', m.status);
    console.log('    userId:', m.userId);
    console.log('    groupId:', m.groupId);
  }

  // Query raw group structure
  console.log('\n--- Testing raw query ---');
  const { data: rawGroups } = await db.from('groups').select('*').limit(1);
  console.log('Raw group:', JSON.stringify(rawGroups?.[0], null, 2));
}

testDirectLink().catch(console.error);
