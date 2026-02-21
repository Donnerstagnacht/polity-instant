/**
 * Clean Database Seeder
 * Deletes all existing entities from the database before seeding.
 * This ensures a fresh start for the seeding process.
 */

import type { EntitySeeder, SeedContext } from '../types/seeder.types';

export const cleanDatabaseSeeder: EntitySeeder = {
  name: 'cleanDatabase',
  dependencies: [],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    console.log('🗑️  Cleaning existing data (deleting all entities)...\n');

    try {
      // Delete all entities in dependency order (children first, then parents)
      const tablesToDelete = [
        'stripePayments',
        'stripeSubscriptions',
        'stripeCustomers',
        'commentVotes',
        'threadVotes',
        'comments',
        'threads',
        'meetingBookings',
        'meetingSlots',
        'hashtags',
        'links',
        'payments',
        'timelineEvents',
        'speakerList',
        'amendmentPathSegments',
        'amendmentPaths',
        'documentVersions',
        'documentCursors',
        'documentCollaborators',
        'documents',
        'amendmentVoteEntries',
        'changeRequestVotes',
        'changeRequests',
        'amendmentVotes',
        'electionVotes',
        'electionCandidates',
        'elections',
        'agendaItems',
        'positions',
        'positionHolderHistory',
        'scheduledElections',
        'eventPositionHolders',
        'eventPositions',
        'todoAssignments',
        'todos',
        'notifications',
        'participants',
        'actionRights',
        'blogBloggers',
        'amendmentCollaborators',
        'eventParticipants',
        'eventVotes',
        'eventVotingSessions',
        'amendmentVotingSessions',
        'supportConfirmations',
        'eventDelegates',
        'groupDelegateAllocations',
        'events',
        'messages',
        'conversationParticipants',
        'conversations',
        'subscribers',
        'follows',
        'reactions',
        'groupRelationships',
        'groupMemberships',
        'groups',
        'amendments',
        'blogs',
        'statements',
        'stats',
        'roles',
        'magicCodes',
        'profiles',
      ];

      let totalDeleted = 0;

      for (const table of tablesToDelete) {
        try {
          const { count, error } = await db
            .from(table)
            .delete({ count: 'exact' })
            .gte('id', '00000000-0000-0000-0000-000000000000');

          if (error) {
            // Table might not exist yet, skip silently
            continue;
          }

          if (count && count > 0) {
            totalDeleted += count;
            console.log(`  Deleted ${count} rows from ${table}`);
          }
        } catch {
          // Table might not exist, skip
          continue;
        }
      }

      if (totalDeleted > 0) {
        console.log(`\n  ✓ Database cleaned (${totalDeleted} total rows deleted)\n`);
      } else {
        console.log('  ✓ No existing data to clean\n');
      }
    } catch (error) {
      console.warn('  ⚠️  Warning: Could not clean all data:', error);
      console.log('  Continuing with seed...\n');
    }

    // Return context unchanged (database cleanup doesn't create any entities)
    return context;
  },
};
