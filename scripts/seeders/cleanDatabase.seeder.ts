/**
 * Clean Database Seeder
 * Deletes all existing entities from the database before seeding.
 * This ensures a fresh start for the seeding process.
 */

import { tx } from '@instantdb/admin';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';

export const cleanDatabaseSeeder: EntitySeeder = {
  name: 'cleanDatabase',
  dependencies: [],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    console.log('🗑️  Cleaning existing data (deleting all entities)...\n');

    try {
      // Query all entities to delete (including $users)
      const query = {
        $users: {},
        stats: {},
        statements: {},
        blogs: {},
        blogBloggers: {},
        amendments: {},
        amendmentCollaborators: {},
        groups: {},
        groupMemberships: {},
        groupRelationships: {},
        follows: {},
        subscribers: {},
        conversations: {},
        conversationParticipants: {},
        messages: {},
        events: {},
        eventParticipants: {},
        notifications: {},
        todos: {},
        todoAssignments: {},
        magicCodes: {},
        agendaItems: {},
        elections: {},
        electionCandidates: {},
        electionVotes: {},
        amendmentVotes: {},
        changeRequests: {},
        changeRequestVotes: {},
        amendmentVoteEntries: {},
        positions: {},
        documents: {},
        documentCollaborators: {},
        documentCursors: {},
        documentVersions: {},
        hashtags: {},
        links: {},
        payments: {},
        meetingSlots: {},
        meetingBookings: {},
        comments: {},
        commentVotes: {},
        threads: {},
        threadVotes: {},
        timelineEvents: {},
        speakerList: {},
        amendmentPaths: {},
        roles: {},
        actionRights: {},
        participants: {},
        stripeCustomers: {},
        stripeSubscriptions: {},
        stripePayments: {},
      };

      const data = await db.query(query);
      const deleteTransactions = [];

      // Delete all entities in dependency order (children first, then parents)
      const entitiesToDelete = [
        'stripePayments', // Delete Stripe payments first
        'stripeSubscriptions', // Delete Stripe subscriptions
        'stripeCustomers', // Delete Stripe customers
        'commentVotes', // Delete comment votes first
        'threadVotes', // Delete thread votes first
        'comments', // Delete comments
        'threads', // Delete threads
        'meetingBookings', // Delete meeting bookings first
        'meetingSlots', // Delete meeting slots
        'hashtags', // Delete hashtags first (they link to other entities)
        'links', // Delete links
        'payments', // Delete payments
        'timelineEvents', // Delete timeline events
        'speakerList', // Delete speaker list
        'amendmentPaths', // Delete amendment paths
        'documentVersions', // Delete document versions
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
        'todoAssignments',
        'todos',
        'notifications',
        'participants', // Delete participants
        'actionRights', // Delete action rights before roles
        'blogBloggers', // Delete blog bloggers
        'amendmentCollaborators', // Delete amendment collaborators
        'eventParticipants',
        'events',
        'messages',
        'conversationParticipants',
        'conversations',
        'subscribers', // Delete subscribers
        'follows',
        'groupRelationships', // Delete group relationships
        'groupMemberships',
        'groups',
        'amendments',
        'blogs',
        'statements',
        'stats',
        'roles', // Delete roles after action rights but before users
        'magicCodes',
        '$users', // Delete $users last to avoid foreign key issues
      ];

      for (const entityType of entitiesToDelete) {
        const entities = (data as any)[entityType] || [];
        for (const entity of entities) {
          deleteTransactions.push((tx as any)[entityType][entity.id].delete());
        }
      }

      if (deleteTransactions.length > 0) {
        console.log(`  Deleting ${deleteTransactions.length} existing records...`);

        // Delete in batches of 100 to avoid timeout
        const batchSize = 100;
        for (let i = 0; i < deleteTransactions.length; i += batchSize) {
          const batch = deleteTransactions.slice(i, i + batchSize);
          await db.transact(batch);
          console.log(
            `    Deleted ${Math.min(i + batchSize, deleteTransactions.length)} / ${deleteTransactions.length}`
          );
        }

        console.log('  ✓ Database cleaned\n');
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
