import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';
import { randomInt, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const followsSeeder: EntitySeeder = {
  name: 'follows',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding follows...');
    const { db, userIds } = context;
    const transactions = [];
    const followIds: string[] = [];
    const mainUserId = SEED_CONFIG.mainTestUserId;
    let followsToFollowers = 0;
    let followsToFollowed = 0;

    // Main user following 10 random users
    const mainUserFollowing = randomItems(
      userIds.filter(id => id !== mainUserId),
      10
    );
    for (const followedId of mainUserFollowing) {
      const followId = id();
      followIds.push(followId);
      transactions.push(
        tx.follows[followId]
          .update({ createdAt: faker.date.past({ years: 1 }) })
          .link({ follower: mainUserId, followed: followedId })
      );
      followsToFollowers++;
      followsToFollowed++;
    }

    // 5 random users following main user
    const mainUserFollowers = randomItems(
      userIds.filter(id => id !== mainUserId && !mainUserFollowing.includes(id)),
      5
    );
    for (const followerId of mainUserFollowers) {
      const followId = id();
      followIds.push(followId);
      transactions.push(
        tx.follows[followId]
          .update({ createdAt: faker.date.past({ years: 1 }) })
          .link({ follower: followerId, followed: mainUserId })
      );
      followsToFollowers++;
      followsToFollowed++;
    }

    // Random follows between other users
    const followCount = randomInt(SEED_CONFIG.followsPerUser.min, SEED_CONFIG.followsPerUser.max);
    for (const userId of userIds) {
      if (userId === mainUserId) continue;

      const numFollows = randomInt(followCount, followCount + 3);
      const usersToFollow = randomItems(
        userIds.filter(id => id !== userId),
        numFollows
      );

      for (const followedId of usersToFollow) {
        const followId = id();
        followIds.push(followId);
        transactions.push(
          tx.follows[followId]
            .update({ createdAt: faker.date.past({ years: 1 }) })
            .link({ follower: userId, followed: followedId })
        );
        followsToFollowers++;
        followsToFollowed++;
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${followIds.length} follows`);
    console.log(`  - Follow-to-follower links: ${followsToFollowers}`);
    console.log(`  - Follow-to-followed links: ${followsToFollowed}`);

    return {
      ...context,
      followIds,
      linkCounts: {
        ...context.linkCounts,
        followsToFollowers: (context.linkCounts?.followsToFollowers || 0) + followsToFollowers,
        followsToFollowed: (context.linkCounts?.followsToFollowed || 0) + followsToFollowed,
      },
    };
  },
};
