import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG, EVENT_HASHTAGS } from '../config/seed.config';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';

export const eventsSeeder: EntitySeeder = {
  name: 'events',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding events...');
    const { db, userIds, groupIds } = context;
    const eventIds: string[] = [];
    const eventOrganizers = new Map<string, string>();
    const transactions = [];
    let eventsToOrganizers = 0;
    let eventsToGroups = 0;

    const now = new Date();

    // Create events for random users and groups
    const numEvents = randomInt(SEED_CONFIG.events.min, SEED_CONFIG.events.max);

    for (let i = 0; i < numEvents; i++) {
      const eventId = id();
      eventIds.push(eventId);

      const organizerId = randomItem(userIds);
      eventOrganizers.set(eventId, organizerId); // Track organizer for RBAC seeder
      const groupId = randomItem(groupIds); // Always assign a group

      // Random date in the future (0-90 days)
      const daysInFuture = randomInt(0, 90);
      const startDate = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
      const durationHours = randomInt(1, 6);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      // Amendment cutoff date (1-30 days before event, or same as event start)
      const daysBeforeEvent = randomInt(0, 30); // 0 means cutoff = event start
      const amendmentCutoffDate = new Date(startDate.getTime() - daysBeforeEvent * 24 * 60 * 60 * 1000);

      // Determine event type (add variety)
      let eventType: string;
      let delegateAllocationMode: string | undefined;
      let totalDelegates: number | undefined;
      let delegateRatio: number | undefined;

      if (i < 2) {
        // First 2 events are delegate conferences (all events have groups now)
        eventType = 'delegate_conference';
        // First uses ratio mode, second uses total mode
        if (i === 0) {
          delegateAllocationMode = 'ratio';
          delegateRatio = 50; // 1 delegate per 50 members
        } else {
          delegateAllocationMode = 'total';
          totalDelegates = 10; // Fixed 10 delegates
        }
      } else if (i < 4) {
        // Next 2 are general assemblies
        eventType = 'general_assembly';
      } else if (i < 6) {
        // Next 2 are open assemblies
        eventType = 'open_assembly';
      } else {
        // Rest are random or 'other'
        eventType = randomItem(['delegate_conference', 'general_assembly', 'open_assembly', 'other']);
        // Random delegate conferences get random allocation mode
        if (eventType === 'delegate_conference') {
          delegateAllocationMode = randomItem(['ratio', 'total']);
          if (delegateAllocationMode === 'ratio') {
            delegateRatio = randomItem([25, 50, 75, 100]); // Various ratios
          } else {
            totalDelegates = randomInt(5, 20);
          }
        }
      }

      const eventTx = tx.events[eventId].update({
        title: faker.lorem.words(randomInt(3, 6)),
        description: faker.lorem.paragraph(),
        location:
          faker.helpers.maybe(() => faker.location.streetAddress(), { probability: 0.7 }) ||
          'Online',
        startDate,
        endDate,
        isPublic: faker.datatype.boolean(0.7),
        capacity: randomInt(10, 200),
        imageURL: faker.image.url(),
        streamURL: i === 0 ? 'https://www.youtube.com/watch?v=9UMxZofMNbA' : undefined, // Add stream URL to first event
        tags: randomItems(
          ['meetup', 'workshop', 'conference', 'social', 'training'],
          randomInt(1, 3)
        ),
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: faker.date.recent({ days: 7 }),
        visibility: randomVisibility(),
        public_participants: faker.datatype.boolean(0.5), // 50% chance participants are publicly visible
        amendment_cutoff_date: amendmentCutoffDate,
        eventType,
        delegatesFinalized: false,
        delegateAllocationMode,
        totalDelegates,
        delegateRatio,
      });

      // All events now have groups
      transactions.push(eventTx.link({ organizer: organizerId, group: groupId }));
      eventsToOrganizers++;
      eventsToGroups++;

      // Add hashtags for this event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(eventId, 'event', eventHashtags));
    }

    // Batch transact
    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${eventIds.length} events`);
    console.log(`  - Event-to-organizer links: ${eventsToOrganizers}`);
    console.log(`  - Event-to-group links: ${eventsToGroups}`);
    console.log(`  - Participants will be created by RBAC seeder with proper roles`);

    return {
      ...context,
      eventIds,
      eventOrganizers,
      linkCounts: {
        ...context.linkCounts,
        eventsToOrganizers: (context.linkCounts?.eventsToOrganizers || 0) + eventsToOrganizers,
        eventsToGroups: (context.linkCounts?.eventsToGroups || 0) + eventsToGroups,
      },
    };
  },
};
