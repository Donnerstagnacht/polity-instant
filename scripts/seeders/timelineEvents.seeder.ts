/**
 * Timeline Events Seeder
 * Seeds activity feed showing various actions on subscribed content
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';

export const timelineEventsSeeder: EntitySeeder = {
  name: 'timelineEvents',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];
    const blogIds = context.blogIds || [];

    console.log('Seeding timeline events...');
    const transactions = [];
    const timelineEventIds: string[] = [];

    // Initialize link counters
    let timelineEventsToActors = 0;
    let timelineEventsToAmendments = 0;
    let timelineEventsToEvents = 0;
    let timelineEventsToBlogs = 0;
    let timelineEventsToGroups = 0;
    let timelineEventsToUsers = 0;

    const entityConfigs = [
      {
        type: 'amendment',
        ids: amendmentIds,
        events: ['created', 'updated', 'comment_added', 'vote_started', 'status_changed'],
        titles: () => [
          `Amendment draft created`,
          `Amendment updated with new changes`,
          `New comment on amendment discussion`,
          `Voting started for amendment`,
          `Amendment status changed to approved`,
        ],
        descriptions: () => [
          `A new amendment proposal has been drafted and is open for review`,
          `The amendment text has been revised based on community feedback`,
          `Community members are discussing the implications of this amendment`,
          `The voting period has begun - make your voice heard`,
          `This amendment has progressed to the next stage`,
        ],
      },
      {
        type: 'event',
        ids: eventIds,
        events: ['created', 'updated', 'participant_joined', 'status_changed'],
        titles: () => [
          `New event scheduled`,
          `Event details updated`,
          `New participant joined event`,
          `Event status changed`,
        ],
        descriptions: () => [
          `An exciting new event has been added to the calendar`,
          `Important updates have been made to the event information`,
          `Another member is attending this event`,
          `The event status has been updated`,
        ],
      },
      {
        type: 'blog',
        ids: blogIds,
        events: ['created', 'updated', 'comment_added', 'published'],
        titles: () => [
          `New blog post published`,
          `Blog post updated`,
          `New comment on blog post`,
          `Blog post now live`,
        ],
        descriptions: () => [
          `Fresh insights and perspectives have been shared`,
          `The author has added additional information to this post`,
          `The community is engaging with this content`,
          `This post is now available for everyone to read`,
        ],
      },
      {
        type: 'group',
        ids: groupIds,
        events: ['created', 'updated', 'member_added', 'status_changed'],
        titles: () => [
          `New group created`,
          `Group information updated`,
          `New member joined group`,
          `Group settings changed`,
        ],
        descriptions: () => [
          `A new community group has been established`,
          `Group details and description have been refreshed`,
          `The community is growing with new members`,
          `Group administrators made updates to settings`,
        ],
      },
      {
        type: 'user',
        ids: userIds.slice(0, 10),
        events: ['updated', 'status_changed'],
        titles: () => [`User updated`, `User status changed`],
        descriptions: () => [
          `This user has updated their information`,
          `Activity status has been updated`,
        ],
      },
    ];

    let eventsCreated = 0;

    // Create timeline events for each entity type
    for (const config of entityConfigs) {
      const entitiesToProcess = config.ids.slice(0, Math.min(config.ids.length, 15));

      for (const entityId of entitiesToProcess) {
        // Create 2-4 events per entity
        const numEvents = randomInt(2, 4);

        for (let i = 0; i < numEvents; i++) {
          const eventType = randomItem(config.events);
          const eventIndex = config.events.indexOf(eventType);
          const title = config.titles()[eventIndex];
          const description = config.descriptions()[eventIndex];
          const actorId = randomItem(userIds);

          const timelineEventId = id();
          timelineEventIds.push(timelineEventId);
          const daysAgo = randomInt(1, 30);

          // Create metadata based on event type
          let metadata = {};
          if (eventType === 'vote_started') {
            metadata = {
              votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              expectedTurnout: randomInt(50, 200),
            };
          } else if (eventType === 'status_changed') {
            metadata = {
              oldStatus: randomItem(['draft', 'pending', 'active']),
              newStatus: randomItem(['active', 'approved', 'published']),
            };
          } else if (eventType === 'comment_added') {
            metadata = {
              commentCount: randomInt(1, 25),
              replyCount: randomInt(0, 10),
            };
          } else if (eventType === 'participant_joined') {
            metadata = {
              participantCount: randomInt(5, 50),
              capacity: randomInt(50, 200),
            };
          }

          transactions.push(
            tx.timelineEvents[timelineEventId]
              .update({
                eventType,
                entityType: config.type,
                entityId,
                title,
                description,
                metadata,
                createdAt: faker.date.recent({ days: daysAgo }),
              })
              .link({
                actor: actorId,
                [config.type]: entityId,
              })
          );
          eventsCreated++;

          // Track link creations
          timelineEventsToActors++; // All timeline events link to actor

          // Increment counter based on entity type
          if (config.type === 'amendment') {
            timelineEventsToAmendments++;
          } else if (config.type === 'event') {
            timelineEventsToEvents++;
          } else if (config.type === 'blog') {
            timelineEventsToBlogs++;
          } else if (config.type === 'group') {
            timelineEventsToGroups++;
          } else if (config.type === 'user') {
            timelineEventsToUsers++;
          }
        }
      }
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    console.log(`✓ Created ${eventsCreated} timeline events across all entity types`);

    return {
      ...context,
      timelineEventIds,
      linkCounts: {
        ...(context.linkCounts || {}),
        timelineEventsToActors,
        timelineEventsToAmendments,
        timelineEventsToEvents,
        timelineEventsToBlogs,
        timelineEventsToGroups,
        timelineEventsToUsers,
      },
    };
  },
};
