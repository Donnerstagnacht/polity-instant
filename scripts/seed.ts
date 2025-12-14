#!/usr/bin/env ts-node
/**
 * Polity Database Seeding Script
 *
 * This script seeds the database with test data for development and E2E testing.
 *
 * Usage:
 *   npm run seed              # Seed all entities
 *   npm run seed -- --only=users,groups    # Seed only users and groups (and their dependencies)
 *   npm run seed -- --skip=events          # Seed all except events
 *   npm run seed -- --list                 # List all available seeders
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { SeedOrchestrator } from './seed.orchestrator';
import { cleanDatabaseSeeder } from './seeders/cleanDatabase.seeder';
import { usersSeeder } from './seeders/users.seeder';
import { groupsSeeder } from './seeders/groups.seeder';
import { groupRelationshipsSeeder } from './seeders/groupRelationships.seeder';
import { eventsSeeder } from './seeders/events.seeder';
import { followsSeeder } from './seeders/follows.seeder';
import { positionsSeeder } from './seeders/positions.seeder';
import { eventPositionsSeeder } from './seeders/eventPositions.seeder';
import { linksSeeder } from './seeders/links.seeder';
import { conversationsSeeder } from './seeders/conversations.seeder';
import { todosSeeder } from './seeders/todos.seeder';
import { notificationsSeeder } from './seeders/notifications.seeder';
import { documentsSeeder } from './seeders/documents.seeder';
import { paymentsSeeder } from './seeders/payments.seeder';
import { subscriptionsSeeder } from './seeders/subscriptions.seeder';
import { invitationsSeeder } from './seeders/invitations.seeder';
import { rbacSeeder } from './seeders/rbac.seeder';
import { agendaAndVotingSeeder } from './seeders/agendaAndVoting.seeder';
import { meetingSlotsSeeder } from './seeders/meetingSlots.seeder';
import { blogCommentsSeeder } from './seeders/blogComments.seeder';
import { timelineEventsSeeder } from './seeders/timelineEvents.seeder';
import { stripeDataSeeder } from './seeders/stripeData.seeder';
import { tobiasSubscriptionsSeeder } from './seeders/tobiasSubscriptions.seeder';
import { blogsSeeder } from './seeders/blogs.seeder';
import { amendmentsSeeder } from './seeders/amendments.seeder';

// Load environment variables from .env and .env.local
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!APP_ID) console.error('   NEXT_PUBLIC_INSTANT_APP_ID');
  if (!ADMIN_TOKEN) console.error('   INSTANT_ADMIN_TOKEN');
  process.exit(1);
}

async function main() {
  // Parse CLI arguments
  const args = process.argv.slice(2);
  const listFlag = args.includes('--list');

  const onlyArg = args.find(arg => arg.startsWith('--only='));
  const skipArg = args.find(arg => arg.startsWith('--skip='));

  const only = onlyArg
    ? onlyArg
        .split('=')[1]
        .split(',')
        .map(s => s.trim())
    : undefined;
  const skip = skipArg
    ? skipArg
        .split('=')[1]
        .split(',')
        .map(s => s.trim())
    : undefined;

  // Create orchestrator (APP_ID and ADMIN_TOKEN are checked above)
  const orchestrator = new SeedOrchestrator(APP_ID as string, ADMIN_TOKEN as string);

  // Register all seeders
  orchestrator.registerAll([
    cleanDatabaseSeeder,
    usersSeeder,
    groupsSeeder,
    blogsSeeder,
    amendmentsSeeder,
    groupRelationshipsSeeder,
    followsSeeder,
    positionsSeeder,
    linksSeeder,
    paymentsSeeder,
    invitationsSeeder,
    conversationsSeeder,
    eventsSeeder,
    eventPositionsSeeder,
    rbacSeeder,
    agendaAndVotingSeeder,
    subscriptionsSeeder,
    notificationsSeeder,
    todosSeeder,
    documentsSeeder,
    meetingSlotsSeeder,
    blogCommentsSeeder,
    timelineEventsSeeder,
    stripeDataSeeder,
    tobiasSubscriptionsSeeder,
  ]);

  // Handle --list flag
  if (listFlag) {
    orchestrator.listSeeders();
    return;
  }

  // Run seeders
  try {
    await orchestrator.run({ only, skip });
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
    process.exit(1);
  }
}

main();
