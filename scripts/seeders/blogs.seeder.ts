/**
 * Blogs Seeder
 * Creates blog posts for users and groups
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItems, randomVisibility } from '../helpers/random.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';
import { BLOG_HASHTAGS, SEED_CONFIG } from '../config/seed.config';

export const blogsSeeder: EntitySeeder = {
  name: 'blogs',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const groupIds = context.groupIds || [];
    const blogIds: string[] = [...(context.blogIds || [])];
    const transactions = [];

    console.log('Seeding blogs...');

    const mainUserId = SEED_CONFIG.mainTestUserId;

    // Create main user's blog post
    const mainBlogId = id();
    blogIds.push(mainBlogId);

    transactions.push(
      tx.blogs[mainBlogId]
        .update({
          title: 'Welcome to Polity Test Environment',
          date: new Date().toISOString(),
          likeCount: randomInt(10, 50),
          commentCount: randomInt(5, 20),
          visibility: 'public',
        })
        .link({ user: mainUserId })
    );

    const mainBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
    transactions.push(...createHashtagTransactions(mainBlogId, 'blog', mainBlogHashtags));

    // Create blog posts for each group (1-3 blogs per group)
    for (const groupId of groupIds) {
      const groupBlogCount = randomInt(1, 3);
      for (let j = 0; j < groupBlogCount; j++) {
        const blogId = id();
        blogIds.push(blogId);
        transactions.push(
          tx.blogs[blogId]
            .update({
              title: faker.lorem.sentence(),
              date: faker.date.past({ years: 0.5 }).toISOString(),
              likeCount: randomInt(5, 100),
              commentCount: randomInt(0, 50),
              visibility: randomVisibility(),
            })
            .link({ user: mainUserId, group: groupId })
        );

        const blogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
        transactions.push(...createHashtagTransactions(blogId, 'blog', blogHashtags));
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

    console.log(`✓ Created ${blogIds.length} blog posts`);

    return {
      ...context,
      blogIds,
    };
  },
};
