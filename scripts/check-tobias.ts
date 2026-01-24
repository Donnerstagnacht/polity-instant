import { init, id, tx } from '@instantdb/admin';
import { config } from 'dotenv';
import { resolve } from 'path';
import schema from '../db/instant.schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  adminToken: process.env.INSTANT_ADMIN_TOKEN!,
  schema,
});

async function testDirectLink() {
  console.log('=== Direct Link Test ===\n');

  // Step 1: Get groups with their roles properly
  const groups = await db.query({
    groups: {
      $: { limit: 1 },
      roles: {},
      owner: {},
    },
  });

  const group = groups.groups?.[0] as any;
  console.log('Group:', group?.name);
  console.log('Group owner:', JSON.stringify(group?.owner));
  console.log('Group roles:', group?.roles?.length || 0);
  if (group?.roles?.length > 0) {
    console.log('  First role:', group.roles[0]);
  }

  // Let's check a group membership that should exist
  const allMemberships = await db.query({
    groupMemberships: {
      $: { limit: 3 },
      user: {},
      group: {},
    },
  });

  console.log('\n--- Existing memberships ---');
  console.log('Count:', allMemberships.groupMemberships?.length);
  for (const m of (allMemberships.groupMemberships || []) as any[]) {
    console.log('  Membership:', m.id);
    console.log('    status:', m.status);
    console.log('    user:', m.user);
    console.log('    group:', m.group);
  }

  // Let's try raw InstaQL without schema
  console.log('\n--- Testing raw query on rels ---');

  // Query some groups and their actual DB structure
  const rawGroups = await db.query({
    groups: {
      $: { limit: 1 },
    },
  });
  console.log('Raw group:', JSON.stringify(rawGroups.groups?.[0], null, 2));
}

testDirectLink().catch(console.error);
