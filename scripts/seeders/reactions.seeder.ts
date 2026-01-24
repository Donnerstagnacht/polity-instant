/**
 * Reactions Seeder
 * Seeds sample reactions for timeline events to simulate user engagement
 * Supports the Pinterest-style timeline reaction system (support, oppose, interested, like, celebrate)
 */

import { id, tx } from '@instantdb/admin';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';

// Reaction types with realistic distribution weights
const REACTION_TYPES = [
  { type: 'support', weight: 35 },
  { type: 'like', weight: 30 },
  { type: 'interested', weight: 20 },
  { type: 'oppose', weight: 10 },
  { type: 'celebrate', weight: 5 },
];

// Get a weighted random reaction type
function getWeightedReactionType(): string {
  const totalWeight = REACTION_TYPES.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const reaction of REACTION_TYPES) {
    random -= reaction.weight;
    if (random <= 0) {
      return reaction.type;
    }
  }

  return 'like'; // Fallback
}

export const reactionsSeeder: EntitySeeder = {
  name: 'reactions',
  dependencies: ['users', 'timelineEvents'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const timelineEventIds = context.timelineEventIds || [];

    if (timelineEventIds.length === 0) {
      console.log('⚠️  No timeline events to add reactions to, skipping reactions seeder');
      return context;
    }

    console.log('Seeding reactions for timeline events...');
    const transactions = [];
    const reactionIds: string[] = [];

    // Initialize link counters
    let reactionsToUsers = 0;
    let reactionsToTimelineEvents = 0;

    // Track which user-timelineEvent pairs already have a reaction
    // (users can only have one reaction per entity)
    const existingReactions = new Set<string>();

    // Create reactions for each timeline event
    // Some events get many reactions (popular), some get few
    for (const timelineEventId of timelineEventIds) {
      // Determine popularity - some items are more popular than others
      const popularityTier = Math.random();
      let numReactions: number;

      if (popularityTier > 0.9) {
        // Top 10% - very popular
        numReactions = randomInt(15, 30);
      } else if (popularityTier > 0.6) {
        // Next 30% - moderately popular
        numReactions = randomInt(5, 15);
      } else if (popularityTier > 0.3) {
        // Middle 30% - some engagement
        numReactions = randomInt(2, 8);
      } else {
        // Bottom 30% - low engagement
        numReactions = randomInt(0, 3);
      }

      // Ensure we don't try to add more reactions than we have users
      numReactions = Math.min(numReactions, userIds.length);

      // Shuffle users to get random reactors
      const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());

      for (let i = 0; i < numReactions; i++) {
        const userId = shuffledUsers[i];
        const pairKey = `${userId}-${timelineEventId}`;

        // Skip if this user already reacted to this event
        if (existingReactions.has(pairKey)) {
          continue;
        }
        existingReactions.add(pairKey);

        const reactionId = id();
        reactionIds.push(reactionId);

        const reactionType = getWeightedReactionType();

        transactions.push(
          tx.reactions[reactionId]
            .update({
              entityId: timelineEventId,
              entityType: 'timelineEvent',
              reactionType,
              createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000).getTime(),
            })
            .link({
              user: userId,
              timelineEvent: timelineEventId,
            })
        );

        reactionsToUsers++;
        reactionsToTimelineEvents++;
      }
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    // Calculate reaction type distribution for logging
    const reactionCounts = REACTION_TYPES.reduce(
      (acc, r) => ({ ...acc, [r.type]: 0 }),
      {} as Record<string, number>
    );

    console.log(
      `✅ Created ${reactionIds.length} reactions across ${timelineEventIds.length} timeline events`
    );

    return {
      ...context,
      reactionIds,
      linkCounts: {
        ...(context.linkCounts || {}),
        reactionsToUsers,
        reactionsToTimelineEvents,
      },
    };
  },
};

export default reactionsSeeder;
