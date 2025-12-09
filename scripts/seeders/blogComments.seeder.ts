/**
 * Blog Comments Seeder
 * Seeds comments, replies, and votes on blog posts
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const blogCommentsSeeder: EntitySeeder = {
  name: 'blogComments',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const blogIds = context.blogIds || [];

    console.log('Seeding blog comments and likes...');
    const transactions = [];
    let totalComments = 0;
    let totalReplies = 0;
    let totalVotes = 0;

    const allCommentIds: string[] = [];
    const commentVoteIds: string[] = [];

    // For each blog, create 3-8 comments
    for (const blogId of blogIds) {
      const commentCount = randomInt(3, 8);
      const commenters = randomItems(userIds, commentCount);
      const commentIds: string[] = [];

      for (const commenterId of commenters) {
        const commentId = id();
        commentIds.push(commentId);
        allCommentIds.push(commentId);

        transactions.push(
          tx.comments[commentId]
            .update({
              text: faker.lorem.paragraph(),
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: faker.date.recent({ days: 7 }),
              upvotes: randomInt(0, 25),
              downvotes: randomInt(0, 5),
            })
            .link({ blog: blogId, creator: commenterId })
        );
        totalComments++;

        // Add votes for this comment (1-5 voters per comment)
        const voteCount = randomInt(1, 5);
        const voters = randomItems(userIds, voteCount);

        for (const voterId of voters) {
          const voteId = id();
          commentVoteIds.push(voteId);
          const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

          transactions.push(
            tx.commentVotes[voteId]
              .update({
                vote: voteValue,
                createdAt: faker.date.recent({ days: 30 }),
              })
              .link({ comment: commentId, user: voterId })
          );
          totalVotes++;
        }
      }

      // Add 1-3 replies to random comments
      const replyCount = Math.min(randomInt(1, 3), commentIds.length);
      for (let i = 0; i < replyCount; i++) {
        const parentCommentId = randomItem(commentIds);
        const replyId = id();
        allCommentIds.push(replyId);
        const replierId = randomItem(userIds);

        transactions.push(
          tx.comments[replyId]
            .update({
              text: faker.lorem.sentence(),
              createdAt: faker.date.recent({ days: 14 }),
              updatedAt: faker.date.recent({ days: 7 }),
              upvotes: randomInt(0, 10),
              downvotes: randomInt(0, 2),
            })
            .link({
              blog: blogId,
              creator: replierId,
              parentComment: parentCommentId,
            })
        );
        totalReplies++;

        // Add votes for replies (0-3 voters per reply)
        const replyVoteCount = randomInt(0, 3);
        const replyVoters = randomItems(userIds, replyVoteCount);

        for (const voterId of replyVoters) {
          const voteId = id();
          commentVoteIds.push(voteId);
          const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

          transactions.push(
            tx.commentVotes[voteId]
              .update({
                vote: voteValue,
                createdAt: faker.date.recent({ days: 14 }),
              })
              .link({ comment: replyId, user: voterId })
          );
          totalVotes++;
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

    console.log(`✓ Created ${totalComments} comments with ${totalReplies} replies`);
    console.log(`✓ Created ${totalVotes} comment votes`);
    console.log(`  Each blog has 3-8 comments with votes and some replies`);

    return { ...context, commentIds: allCommentIds, commentVoteIds };
  },
};
