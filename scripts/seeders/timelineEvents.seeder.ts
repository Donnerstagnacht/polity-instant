/**
 * Timeline Events Seeder
 * Seeds activity feed showing various actions on subscribed content
 * Updated for Pinterest-style timeline with media, votes, elections, and rich content types
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { SEED_CONFIG } from '../config/seed.config';

// Content type gradients for visual variety
const CONTENT_TYPE_GRADIENTS = {
  group: 'bg-gradient-to-br from-green-100 to-blue-100',
  event: 'bg-gradient-to-br from-orange-100 to-yellow-100',
  amendment: 'bg-gradient-to-br from-purple-100 to-blue-100',
  vote: 'bg-gradient-to-br from-red-100 to-orange-100',
  election: 'bg-gradient-to-br from-rose-100 to-pink-100',
  video: 'bg-gradient-to-br from-pink-100 to-red-100',
  image: 'bg-gradient-to-br from-cyan-100 to-blue-100',
  statement: 'bg-gradient-to-br from-indigo-100 to-purple-100',
  todo: 'bg-gradient-to-br from-yellow-100 to-orange-100',
  blog: 'bg-gradient-to-br from-teal-100 to-green-100',
  action: 'bg-gradient-to-br from-gray-100 to-slate-100',
};

// Sample image URLs for timeline cards
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
  'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800',
  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
  'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?w=800',
  'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800',
];

// Sample video URLs (YouTube)
const SAMPLE_VIDEOS = [
  {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
  },
  {
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
  },
];

// Topic tags for categorization
const TOPIC_TAGS = [
  'transport',
  'budget',
  'climate',
  'healthcare',
  'education',
  'housing',
  'urban',
  'governance',
  'environment',
  'economy',
  'social',
  'justice',
];

export const timelineEventsSeeder: EntitySeeder = {
  name: 'timelineEvents',
  dependencies: [
    'users',
    'groups',
    'events',
    'amendments',
    'blogs',
    'todos',
    'subscriptions',
    'tobiasSubscriptions',
    'agendaAndVoting',
  ],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];
    const blogIds = context.blogIds || [];
    const todoIds = context.todoIds || [];
    const statementIds = context.statementIds || [];

    const mainUserId = SEED_CONFIG.tobiasUserId;

    const subscriptionsData = await db.query({
      subscribers: {
        $: {
          where: {
            'subscriber.id': mainUserId,
          },
        },
        user: {},
        group: {},
        event: {},
        amendment: {},
        blog: {},
      },
    });

    const subscribedUserIds = (subscriptionsData?.subscribers || [])
      .filter((sub: any) => sub.user)
      .map((sub: any) => sub.user.id);
    const subscribedGroupIds = (subscriptionsData?.subscribers || [])
      .filter((sub: any) => sub.group)
      .map((sub: any) => sub.group.id);
    const subscribedEventIds = (subscriptionsData?.subscribers || [])
      .filter((sub: any) => sub.event)
      .map((sub: any) => sub.event.id);
    const subscribedAmendmentIds = (subscriptionsData?.subscribers || [])
      .filter((sub: any) => sub.amendment)
      .map((sub: any) => sub.amendment.id);
    const subscribedBlogIds = (subscriptionsData?.subscribers || [])
      .filter((sub: any) => sub.blog)
      .map((sub: any) => sub.blog.id);

    const pickFrom = <T>(preferred: T[], fallback: T[]): T | undefined =>
      preferred.length > 0
        ? randomItem(preferred)
        : fallback.length > 0
          ? randomItem(fallback)
          : undefined;

    console.log('Seeding timeline events with Pinterest-style content...');
    const transactions = [];
    const timelineEventIds: string[] = [];

    // Initialize link counters
    let timelineEventsToActors = 0;
    let timelineEventsToAmendments = 0;
    let timelineEventsToEvents = 0;
    let timelineEventsToBlogs = 0;
    let timelineEventsToGroups = 0;
    let timelineEventsToUsers = 0;
    let timelineEventsToStatements = 0;
    let timelineEventsToElections = 0;
    let timelineEventsToAmendmentVotes = 0;

    // Query elections with their agenda items for linking
    const electionsData = await db.query({
      elections: {
        agendaItem: {
          event: {},
        },
      },
    });
    const electionsWithAgenda = (electionsData?.elections || []).map((election: any) => ({
      id: election.id,
      title: election.title,
      status: election.status,
      votingEndTime: election.votingEndTime,
      agendaItemId: election.agendaItem?.id,
      agendaEventId: election.agendaItem?.event?.id,
    }));

    // Query amendmentVotes with their agenda items for linking
    const amendmentVotesData = await db.query({
      amendmentVotes: {
        agendaItem: {
          event: {},
        },
      },
    });
    const amendmentVotesWithAgenda = (amendmentVotesData?.amendmentVotes || []).map(
      (vote: any) => ({
        id: vote.id,
        title: vote.title,
        status: vote.status,
        votingEndTime: vote.votingEndTime,
        agendaItemId: vote.agendaItem?.id,
        agendaEventId: vote.agendaItem?.event?.id,
      })
    );

    // Helper to generate random stats
    const generateStats = () => ({
      likes: randomInt(0, 500),
      views: randomInt(10, 5000),
      comments: randomInt(0, 100),
      shares: randomInt(0, 50),
    });

    // Helper to get random topic tags (1-3 tags)
    const getRandomTags = () => {
      const count = randomInt(1, 3);
      const shuffled = [...TOPIC_TAGS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const entityConfigs = [
      {
        type: 'amendment',
        contentType: 'amendment',
        ids: subscribedAmendmentIds.length > 0 ? subscribedAmendmentIds : amendmentIds,
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
        contentType: 'event',
        ids: subscribedEventIds.length > 0 ? subscribedEventIds : eventIds,
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
        contentType: 'blog',
        ids: subscribedBlogIds.length > 0 ? subscribedBlogIds : blogIds,
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
        contentType: 'group',
        ids: subscribedGroupIds.length > 0 ? subscribedGroupIds : groupIds,
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
        contentType: 'action',
        ids: (subscribedUserIds.length > 0 ? subscribedUserIds : userIds).slice(0, 10),
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
      if (!config.ids || config.ids.length === 0) {
        continue;
      }

      const entitiesToProcess = config.ids.slice(0, Math.min(config.ids.length, 15));

      for (const entityId of entitiesToProcess) {
        // Create 2-4 events per entity
        const numEvents = randomInt(2, 4);

        for (let i = 0; i < numEvents; i++) {
          const eventType = randomItem(config.events);
          const eventIndex = config.events.indexOf(eventType);
          const title = config.titles()[eventIndex];
          const description = config.descriptions()[eventIndex];
          if (userIds.length === 0) {
            continue;
          }

          const actorId = randomItem(userIds);

          const timelineEventId = id();
          timelineEventIds.push(timelineEventId);
          const daysAgo = randomInt(1, 30);

          // Create metadata based on event type
          let metadata: Record<string, unknown> = {};
          let voteStatus: string | undefined;
          let electionStatus: string | undefined;
          let endsAt: Date | undefined;

          if (eventType === 'vote_started') {
            voteStatus = 'open';
            endsAt = new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000);
            metadata = {
              votingEndTime: endsAt,
              expectedTurnout: randomInt(50, 200),
              currentSupport: randomInt(30, 70),
              currentOppose: randomInt(10, 40),
              currentAbstain: randomInt(0, 20),
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

          if (!entityId) {
            continue;
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
                contentType: config.contentType,
                tags: getRandomTags(),
                stats: generateStats(),
                voteStatus,
                electionStatus,
                endsAt: endsAt?.getTime(),
                createdAt: faker.date.recent({ days: daysAgo }),
              })
              .link({
                actor: actorId,
                [config.type]: entityId,
              })
          );
          eventsCreated++;

          // Track link creations
          timelineEventsToActors++;

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

    // Create special content types for Pinterest-style timeline

    // 1. Video uploads
    for (let i = 0; i < 5; i++) {
      const video = randomItem(SAMPLE_VIDEOS);
      const timelineEventId = id();
      timelineEventIds.push(timelineEventId);
      const actorId = pickFrom(subscribedUserIds, userIds);
      const groupId = pickFrom(subscribedGroupIds, groupIds);

      if (!actorId || !groupId) {
        continue;
      }

      transactions.push(
        tx.timelineEvents[timelineEventId]
          .update({
            eventType: 'video_uploaded',
            entityType: 'group',
            entityId: groupId,
            title: faker.lorem.sentence(4),
            description: faker.lorem.paragraph(2),
            contentType: 'video',
            videoURL: video.url,
            videoThumbnailURL: video.thumbnail,
            tags: getRandomTags(),
            stats: generateStats(),
            metadata: { duration: randomInt(60, 600), views: randomInt(100, 5000) },
            createdAt: faker.date.recent({ days: randomInt(1, 14) }),
          })
          .link({ actor: actorId, group: groupId })
      );
      eventsCreated++;
      timelineEventsToActors++;
      timelineEventsToGroups++;
    }

    // 2. Image posts
    for (let i = 0; i < 8; i++) {
      const imageURL = randomItem(SAMPLE_IMAGES);
      const timelineEventId = id();
      timelineEventIds.push(timelineEventId);
      const actorId = pickFrom(subscribedUserIds, userIds);
      const groupId = pickFrom(subscribedGroupIds, groupIds);

      if (!actorId || !groupId) {
        continue;
      }

      transactions.push(
        tx.timelineEvents[timelineEventId]
          .update({
            eventType: 'image_uploaded',
            entityType: 'group',
            entityId: groupId,
            title: faker.lorem.sentence(3),
            description: faker.lorem.sentence(10),
            contentType: 'image',
            imageURL,
            tags: getRandomTags(),
            stats: generateStats(),
            createdAt: faker.date.recent({ days: randomInt(1, 21) }),
          })
          .link({ actor: actorId, group: groupId })
      );
      eventsCreated++;
      timelineEventsToActors++;
      timelineEventsToGroups++;
    }

    // 3. Statements
    let statementsForTimeline: Array<{
      id: string;
      user?: { id: string };
      tag?: string;
      text?: string;
    }> = [];

    if (statementIds.length > 0) {
      const statementsData = await db.query({
        statements: {
          $: {
            where: {
              id: { in: statementIds },
            },
          },
          user: {},
        },
      });

      statementsForTimeline = (statementsData?.statements || []).map((statement: any) => ({
        id: statement.id,
        user: statement.user ? { id: statement.user.id } : undefined,
        tag: statement.tag,
        text: statement.text,
      }));
    }

    if (statementsForTimeline.length === 0 && statementIds.length > 0) {
      statementsForTimeline = statementIds.slice(0, 6).map(id => ({ id }));
    }

    for (let i = 0; i < Math.min(6, statementsForTimeline.length); i++) {
      const timelineEventId = id();
      timelineEventIds.push(timelineEventId);
      const statement = statementsForTimeline[i];
      const actorId = statement.user?.id || pickFrom(subscribedUserIds, userIds);

      if (!actorId) {
        continue;
      }

      transactions.push(
        tx.timelineEvents[timelineEventId]
          .update({
            eventType: 'statement_posted',
            entityType: 'user',
            entityId: actorId,
            title: 'Statement',
            description: statement.text || faker.lorem.paragraph(3),
            contentType: 'statement',
            tags: statement.tag ? [statement.tag, ...getRandomTags()] : getRandomTags(),
            stats: generateStats(),
            createdAt: faker.date.recent({ days: randomInt(1, 14) }),
          })
          .link({
            actor: actorId,
            user: actorId,
            ...(statement.id ? { statement: statement.id } : {}),
          })
      );
      eventsCreated++;
      timelineEventsToActors++;
      timelineEventsToUsers++;
      if (statement.id) {
        timelineEventsToStatements++;
      }
    }

    // 4. Vote events (open and closed) - linked to real amendmentVotes with agenda items
    const voteStatuses = ['open', 'open', 'open', 'closed', 'passed', 'rejected'];
    const votesToCreate = Math.min(
      6,
      amendmentVotesWithAgenda.length > 0 ? amendmentVotesWithAgenda.length : 6
    );

    for (let i = 0; i < votesToCreate; i++) {
      if (userIds.length === 0) {
        break;
      }

      const timelineEventId = id();
      timelineEventIds.push(timelineEventId);
      const actorId = randomItem(userIds);
      const status = voteStatuses[i % voteStatuses.length];
      const isOpen = status === 'open';

      // Use real amendmentVote if available, otherwise fall back to amendment
      const realVote = amendmentVotesWithAgenda[i];
      const amendmentId =
        realVote?.id || (amendmentIds.length > 0 ? randomItem(amendmentIds) : null);

      if (!amendmentId) continue;

      const updateData: any = {
        eventType: isOpen ? 'vote_opened' : 'vote_closed',
        entityType: 'amendment',
        entityId: amendmentId,
        title: realVote?.title || `Vote: ${faker.lorem.sentence(4)}`,
        description: faker.lorem.paragraph(2),
        contentType: 'vote',
        tags: getRandomTags(),
        stats: generateStats(),
        voteStatus: status,
        endsAt: isOpen
          ? new Date(Date.now() + randomInt(1, 7) * 24 * 60 * 60 * 1000).getTime()
          : new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000).getTime(),
        metadata: {
          supportPercent: randomInt(30, 80),
          opposePercent: randomInt(10, 50),
          abstainPercent: randomInt(0, 20),
          totalVotes: randomInt(50, 300),
          quorumReached: Math.random() > 0.3,
          // Store agenda item references in metadata for timeline display
          agendaEventId: realVote?.agendaEventId,
          agendaItemId: realVote?.agendaItemId,
        },
        createdAt: faker.date.recent({ days: randomInt(1, 14) }),
      };

      // Build link object
      const linkData: any = { actor: actorId };
      if (realVote) {
        linkData.amendmentVote = realVote.id;
        timelineEventsToAmendmentVotes++;
      } else {
        linkData.amendment = amendmentId;
        timelineEventsToAmendments++;
      }

      transactions.push(tx.timelineEvents[timelineEventId].update(updateData).link(linkData));
      eventsCreated++;
      timelineEventsToActors++;
    }

    // 5. Election events - linked to real elections with agenda items
    const electionStatuses = ['nominations', 'voting', 'voting', 'closed', 'winner'];
    const electionsToCreate = Math.min(
      5,
      electionsWithAgenda.length > 0 ? electionsWithAgenda.length : 5
    );

    for (let i = 0; i < electionsToCreate; i++) {
      if (userIds.length === 0) {
        break;
      }

      const timelineEventId = id();
      timelineEventIds.push(timelineEventId);
      const actorId = randomItem(userIds);
      const status = electionStatuses[i % electionStatuses.length];
      const isActive = status === 'nominations' || status === 'voting';

      // Use real election if available
      const realElection = electionsWithAgenda[i];
      const eventId =
        realElection?.agendaEventId || (eventIds.length > 0 ? randomItem(eventIds) : null);

      if (!eventId) continue;

      const updateData: any = {
        eventType:
          status === 'winner'
            ? 'election_winner_announced'
            : `election_${status === 'nominations' ? 'nominations_open' : status === 'voting' ? 'voting_open' : 'closed'}`,
        entityType: 'event',
        entityId: eventId,
        title: realElection?.title || `Election: ${faker.person.jobTitle()}`,
        description: faker.lorem.paragraph(2),
        contentType: 'election',
        tags: getRandomTags(),
        stats: generateStats(),
        electionStatus: status,
        endsAt: isActive
          ? new Date(Date.now() + randomInt(1, 14) * 24 * 60 * 60 * 1000).getTime()
          : new Date(Date.now() - randomInt(1, 7) * 24 * 60 * 60 * 1000).getTime(),
        metadata: {
          candidates: randomInt(2, 8),
          totalVotes: randomInt(30, 200),
          turnoutPercent: randomInt(40, 90),
          winnerName: status === 'winner' ? faker.person.fullName() : undefined,
          winnerPercent: status === 'winner' ? randomInt(40, 70) : undefined,
          // Store agenda item references in metadata for timeline display
          agendaEventId: realElection?.agendaEventId,
          agendaItemId: realElection?.agendaItemId,
        },
        createdAt: faker.date.recent({ days: randomInt(1, 14) }),
      };

      // Build link object
      const linkData: any = { actor: actorId, event: eventId };
      if (realElection) {
        linkData.election = realElection.id;
        timelineEventsToElections++;
      }

      transactions.push(tx.timelineEvents[timelineEventId].update(updateData).link(linkData));
      eventsCreated++;
      timelineEventsToActors++;
      timelineEventsToEvents++;
    }

    // 6. Todo events (if todos exist)
    let todosForTimeline: Array<{ id: string; group?: { id: string }; creator?: { id: string } }> =
      [];

    if (todoIds && todoIds.length > 0) {
      const todosQuery = {
        todos: {
          $: {
            where: {
              id: { in: todoIds },
            },
          },
          group: {},
          creator: {},
        },
      };

      const todosData = await db.query(todosQuery);
      todosForTimeline = (todosData?.todos || []).map((todo: any) => ({
        id: todo.id,
        group: todo.group ? { id: todo.group.id } : undefined,
        creator: todo.creator ? { id: todo.creator.id } : undefined,
      }));

      if (todosForTimeline.length === 0) {
        todosForTimeline = todoIds.slice(0, 4).map(id => ({ id }));
      }
    }

    if (todosForTimeline.length > 0) {
      for (let i = 0; i < Math.min(4, todosForTimeline.length); i++) {
        const timelineEventId = id();
        timelineEventIds.push(timelineEventId);
        const todo = todosForTimeline[i];
        const actorId = todo.creator?.id || pickFrom(subscribedUserIds, userIds);
        const todoId = todo.id;
        const groupId = todo.group?.id;

        if (!actorId || !todoId) {
          continue;
        }

        transactions.push(
          tx.timelineEvents[timelineEventId]
            .update({
              eventType: 'todo_created',
              entityType: 'todo',
              entityId: todoId,
              title: faker.lorem.sentence(4),
              description: faker.lorem.paragraph(1),
              contentType: 'todo',
              tags: getRandomTags(),
              stats: generateStats(),
              metadata: {
                dueDate: faker.date.soon({ days: randomInt(1, 30) }).getTime(),
                priority: randomItem(['low', 'medium', 'high', 'urgent']),
                assigneeCount: randomInt(1, 5),
                progress: randomInt(0, 100),
              },
              createdAt: faker.date.recent({ days: randomInt(1, 14) }),
            })
            .link({
              actor: actorId,
              todo: todoId,
              ...(groupId ? { group: groupId } : {}),
            })
        );
        eventsCreated++;
        timelineEventsToActors++;
        if (groupId) {
          timelineEventsToGroups++;
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

    console.log(
      `✅ Created ${eventsCreated} timeline events (including ${5} videos, ${8} images, ${6} statements, ${votesToCreate} votes, ${electionsToCreate} elections)`
    );

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
        timelineEventsToStatements,
        timelineEventsToElections,
        timelineEventsToAmendmentVotes,
      },
    };
  },
};
