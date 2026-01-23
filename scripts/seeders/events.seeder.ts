import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG, EVENT_HASHTAGS } from '../config/seed.config';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper to add months to a date
const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

// Helper to add years to a date
const addYears = (date: Date, years: number): Date => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

// Generate recurring event instances based on pattern
const generateRecurringInstances = (
  baseEvent: any,
  pattern: string,
  occurrences: number
): { date: Date; instanceId: string }[] => {
  const instances: { date: Date; instanceId: string }[] = [];
  const startDate = new Date(baseEvent.startDate);

  for (let i = 1; i <= occurrences; i++) {
    let instanceDate: Date;

    switch (pattern) {
      case 'daily':
        instanceDate = addDays(startDate, i);
        break;
      case 'weekly':
        instanceDate = addDays(startDate, i * 7);
        break;
      case 'monthly':
        instanceDate = addMonths(startDate, i);
        break;
      case 'yearly':
        instanceDate = addYears(startDate, i);
        break;
      case 'four-yearly':
        instanceDate = addYears(startDate, i * 4);
        break;
      default:
        instanceDate = addDays(startDate, i);
    }

    instances.push({
      date: instanceDate,
      instanceId: id(),
    });
  }

  return instances;
};

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

    // Recurring event configurations
    const recurringConfigs = [
      { pattern: 'daily', occurrences: 14, title: 'Täglicher Stand-up' },
      { pattern: 'weekly', occurrences: 8, title: 'Wöchentliches Team-Meeting' },
      { pattern: 'monthly', occurrences: 4, title: 'Monatliche Mitgliederversammlung' },
      { pattern: 'yearly', occurrences: 2, title: 'Jährliche Hauptversammlung' },
      { pattern: 'four-yearly', occurrences: 2, title: 'Vierjähriger Parteitag' },
    ];

    // Location types for variety
    const locationTypes = ['online', 'physical', 'hybrid'];

    // Create recurring event series
    for (const config of recurringConfigs) {
      const parentEventId = id();
      eventIds.push(parentEventId);

      const organizerId = randomItem(userIds);
      eventOrganizers.set(parentEventId, organizerId);
      const groupId = randomItem(groupIds);

      // Base start date (3 days from now for daily, more spread for others)
      const daysInFuture = config.pattern === 'daily' ? 3 : randomInt(7, 30);
      const startDate = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
      const durationHours = randomInt(1, 4);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      // Calculate recurring end date
      let recurringEndDate: Date;
      switch (config.pattern) {
        case 'daily':
          recurringEndDate = addDays(startDate, config.occurrences);
          break;
        case 'weekly':
          recurringEndDate = addDays(startDate, config.occurrences * 7);
          break;
        case 'monthly':
          recurringEndDate = addMonths(startDate, config.occurrences);
          break;
        case 'yearly':
          recurringEndDate = addYears(startDate, config.occurrences);
          break;
        case 'four-yearly':
          recurringEndDate = addYears(startDate, config.occurrences * 4);
          break;
        default:
          recurringEndDate = addDays(startDate, config.occurrences);
      }

      const locationType = randomItem(locationTypes);
      const visibility = randomVisibility();

      // Parent event (template)
      const parentEventTx = tx.events[parentEventId].update({
        title: config.title,
        description: faker.lorem.paragraph(),
        startDate,
        endDate,
        isPublic: visibility === 'public',
        visibility,
        participantListVisibility: randomVisibility(),
        capacity: randomInt(10, 100),
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: faker.date.recent({ days: 7 }),
        eventType: randomItem(['general_assembly', 'open_assembly', 'other']),
        status: 'active', // Event status field

        // Recurring fields
        recurringPattern: config.pattern,
        recurringInterval: 1,
        recurringEndDate,

        // Location fields
        locationType,
        ...(locationType === 'online' || locationType === 'hybrid'
          ? {
              onlineMeetingLink: faker.internet.url(),
              meetingCode: faker.string.alphanumeric(8).toUpperCase(),
            }
          : {}),
        ...(locationType === 'physical' || locationType === 'hybrid'
          ? {
              locationName: faker.company.name() + ' ' + randomItem(['Saal', 'Raum', 'Center']),
              street: faker.location.street(),
              houseNumber: faker.location.buildingNumber(),
              postalCode: faker.location.zipCode(),
              city: faker.location.city(),
            }
          : {}),

        // Deadlines for assemblies
        ...(config.pattern === 'monthly' ||
        config.pattern === 'yearly' ||
        config.pattern === 'four-yearly'
          ? {
              delegateNominationDeadline: new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000),
              proposalSubmissionDeadline: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
              amendment_cutoff_date: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000),
            }
          : {}),
      });

      transactions.push(parentEventTx.link({ organizer: organizerId, group: groupId }));
      eventsToOrganizers++;
      eventsToGroups++;

      // Add hashtags for parent event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(parentEventId, 'event', eventHashtags));

      // Generate recurring instances
      const instances = generateRecurringInstances(
        { startDate },
        config.pattern,
        config.occurrences - 1
      );

      for (const instance of instances) {
        const instanceEndDate = new Date(instance.date.getTime() + durationHours * 60 * 60 * 1000);
        eventIds.push(instance.instanceId);
        eventOrganizers.set(instance.instanceId, organizerId);

        const instanceTx = tx.events[instance.instanceId].update({
          title: config.title,
          description: faker.lorem.paragraph(),
          startDate: instance.date,
          endDate: instanceEndDate,
          isPublic: visibility === 'public',
          visibility,
          participantListVisibility: randomVisibility(),
          capacity: randomInt(10, 100),
          createdAt: faker.date.past({ years: 0.5 }),
          updatedAt: faker.date.recent({ days: 7 }),
          eventType: randomItem(['general_assembly', 'open_assembly', 'other']),
          status: 'active', // Event status field

          // Mark as recurring instance
          recurringPattern: config.pattern,
          recurringParentId: parentEventId,
          recurringInstanceDate: instance.date,

          // Copy location fields
          locationType,
          ...(locationType === 'online' || locationType === 'hybrid'
            ? {
                onlineMeetingLink: faker.internet.url(),
                meetingCode: faker.string.alphanumeric(8).toUpperCase(),
              }
            : {}),
          ...(locationType === 'physical' || locationType === 'hybrid'
            ? {
                locationName: faker.company.name() + ' ' + randomItem(['Saal', 'Raum', 'Center']),
                street: faker.location.street(),
                houseNumber: faker.location.buildingNumber(),
                postalCode: faker.location.zipCode(),
                city: faker.location.city(),
              }
            : {}),

          // Deadlines relative to instance date
          ...(config.pattern === 'monthly' ||
          config.pattern === 'yearly' ||
          config.pattern === 'four-yearly'
            ? {
                delegateNominationDeadline: new Date(
                  instance.date.getTime() - 14 * 24 * 60 * 60 * 1000
                ),
                proposalSubmissionDeadline: new Date(
                  instance.date.getTime() - 7 * 24 * 60 * 60 * 1000
                ),
                amendment_cutoff_date: new Date(instance.date.getTime() - 3 * 24 * 60 * 60 * 1000),
              }
            : {}),
        });

        transactions.push(instanceTx.link({ organizer: organizerId, group: groupId }));
        eventsToOrganizers++;
        eventsToGroups++;
      }
    }

    // Create additional non-recurring events
    const numEvents = randomInt(SEED_CONFIG.events.min, SEED_CONFIG.events.max);

    for (let i = 0; i < numEvents; i++) {
      const eventId = id();
      eventIds.push(eventId);

      const organizerId = randomItem(userIds);
      eventOrganizers.set(eventId, organizerId);
      const groupId = randomItem(groupIds);

      // Random date in the future (0-90 days)
      const daysInFuture = randomInt(0, 90);
      const startDate = new Date(now.getTime() + daysInFuture * 24 * 60 * 60 * 1000);
      const durationHours = randomInt(1, 6);
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);

      // Amendment cutoff date (1-30 days before event, or same as event start)
      const daysBeforeEvent = randomInt(0, 30);
      const amendmentCutoffDate = new Date(
        startDate.getTime() - daysBeforeEvent * 24 * 60 * 60 * 1000
      );

      // Determine event type (add variety)
      let eventType: string;
      let delegateAllocationMode: string | undefined;
      let totalDelegates: number | undefined;
      let delegateRatio: number | undefined;

      if (i < 2) {
        eventType = 'delegate_conference';
        if (i === 0) {
          delegateAllocationMode = 'ratio';
          delegateRatio = 50;
        } else {
          delegateAllocationMode = 'total';
          totalDelegates = 10;
        }
      } else if (i < 4) {
        eventType = 'general_assembly';
      } else if (i < 6) {
        eventType = 'open_assembly';
      } else {
        eventType = randomItem([
          'delegate_conference',
          'general_assembly',
          'open_assembly',
          'other',
        ]);
        if (eventType === 'delegate_conference') {
          delegateAllocationMode = randomItem(['ratio', 'total']);
          if (delegateAllocationMode === 'ratio') {
            delegateRatio = randomItem([25, 50, 75, 100]);
          } else {
            totalDelegates = randomInt(5, 20);
          }
        }
      }

      const locationType = randomItem(locationTypes);
      const visibility = randomVisibility();

      // Some events are cancelled for testing (about 10%)
      const isCancelled = i > 3 && Math.random() < 0.1;
      const eventStatus = isCancelled ? 'cancelled' : 'active';

      const eventTx = tx.events[eventId].update({
        title: faker.lorem.words(randomInt(3, 6)),
        description: faker.lorem.paragraph(),
        startDate,
        endDate,
        isPublic: visibility === 'public',
        visibility,
        participantListVisibility: randomVisibility(),
        capacity: randomInt(10, 200),
        imageURL: faker.image.url(),
        streamURL: i === 0 ? 'https://www.youtube.com/watch?v=9UMxZofMNbA' : undefined,
        tags: randomItems(
          ['meetup', 'workshop', 'conference', 'social', 'training'],
          randomInt(1, 3)
        ),
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: faker.date.recent({ days: 7 }),
        public_participants: faker.datatype.boolean(0.5),
        amendment_cutoff_date: amendmentCutoffDate,
        eventType,
        delegatesFinalized: false,
        delegateAllocationMode,
        totalDelegates,
        delegateRatio,
        status: eventStatus,
        ...(isCancelled
          ? {
              cancellationReason: faker.lorem.sentence(),
              cancelledAt: faker.date.recent({ days: 3 }),
            }
          : {}),

        // Location fields
        locationType,
        ...(locationType === 'online' || locationType === 'hybrid'
          ? {
              onlineMeetingLink: faker.internet.url(),
              meetingCode: faker.string.alphanumeric(8).toUpperCase(),
            }
          : {}),
        ...(locationType === 'physical' || locationType === 'hybrid'
          ? {
              locationName: faker.company.name() + ' ' + randomItem(['Saal', 'Raum', 'Center']),
              street: faker.location.street(),
              houseNumber: faker.location.buildingNumber(),
              postalCode: faker.location.zipCode(),
              city: faker.location.city(),
              // Also set legacy location field for backwards compatibility
              location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
            }
          : {
              location: 'Online',
            }),

        // Deadlines for delegate conferences
        ...(eventType === 'delegate_conference'
          ? {
              delegateNominationDeadline: new Date(startDate.getTime() - 21 * 24 * 60 * 60 * 1000),
              proposalSubmissionDeadline: new Date(startDate.getTime() - 14 * 24 * 60 * 60 * 1000),
            }
          : {}),
      });

      transactions.push(eventTx.link({ organizer: organizerId, group: groupId }));
      eventsToOrganizers++;
      eventsToGroups++;

      // Add hashtags for this event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(eventId, 'event', eventHashtags));
    }

    // Batch transact
    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${eventIds.length} events (including recurring instances)`);
    console.log(`  - Daily series: 14 occurrences`);
    console.log(`  - Weekly series: 8 occurrences`);
    console.log(`  - Monthly series: 4 occurrences`);
    console.log(`  - Yearly series: 2 occurrences`);
    console.log(`  - Four-yearly series: 2 occurrences`);
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
