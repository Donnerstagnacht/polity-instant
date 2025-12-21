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
    const userIds = context.userIds || [];
    const blogIds: string[] = [...(context.blogIds || [])];
    const blogRoleIds: string[] = [];
    const transactions = [];
    let userLinks = 0;
    let groupLinks = 0;
    let rolesCreated = 0;

    console.log('Seeding blogs...');

    const mainUserId = SEED_CONFIG.mainTestUserId;
    const tobiasUserId = SEED_CONFIG.tobiasUserId;
    
    // Helper function to create blog role with action rights
    const createBlogRole = (blogId: string, roleName: 'Owner' | 'Writer') => {
      const roleId = id();
      blogRoleIds.push(roleId);
      
      const roleTransactions = [
        tx.roles[roleId].update({
          name: roleName,
          description: roleName === 'Owner' ? 'Full blog control' : 'Can write and edit posts',
          scope: 'blog',
          createdAt: new Date(),
          updatedAt: new Date(),
        }).link({ blog: blogId }),
      ];
      
      // Create action rights for the role
      if (roleName === 'Owner') {
        const manageRightId = id();
        roleTransactions.push(
          tx.actionRights[manageRightId].update({
            resource: 'blogs',
            action: 'manage',
          }).link({ roles: [roleId], blog: blogId })
        );
        
        const manageBloggersRightId = id();
        roleTransactions.push(
          tx.actionRights[manageBloggersRightId].update({
            resource: 'blogBloggers',
            action: 'manage',
          }).link({ roles: [roleId], blog: blogId })
        );
      } else {
        const viewRightId = id();
        roleTransactions.push(
          tx.actionRights[viewRightId].update({
            resource: 'blogs',
            action: 'view',
          }).link({ roles: [roleId], blog: blogId })
        );
        
        const updateRightId = id();
        roleTransactions.push(
          tx.actionRights[updateRightId].update({
            resource: 'blogs',
            action: 'update',
          }).link({ roles: [roleId], blog: blogId })
        );
      }
      
      rolesCreated++;
      return { roleId, transactions: roleTransactions };
    };
    
    // Helper function to assign user to blog with role
    const assignUserToBlog = (blogId: string, userId: string, roleId: string) => {
      const blogBloggerId = id();
      return tx.blogBloggers[blogBloggerId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
          visibility: randomVisibility(),
        })
        .link({ blog: blogId, user: userId, role: roleId });
    };

    // Create main user's blog post
    const mainBlogId = id();
    blogIds.push(mainBlogId);

    // Create blog entity
    transactions.push(
      tx.blogs[mainBlogId].update({
        title: 'Welcome to Polity Test Environment',
        date: new Date().toISOString(),
        likeCount: randomInt(10, 50),
        commentCount: randomInt(5, 20),
        visibility: 'public',
      })
    );

    // Create Owner role and action rights for main blog
    const mainBlogOwnerRole = createBlogRole(mainBlogId, 'Owner');
    transactions.push(...mainBlogOwnerRole.transactions);

    // Assign main user as Owner
    transactions.push(assignUserToBlog(mainBlogId, mainUserId, mainBlogOwnerRole.roleId));
    userLinks++;

    const mainBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
    transactions.push(...createHashtagTransactions(mainBlogId, 'blog', mainBlogHashtags));

    // Create blog posts for each group (1-3 blogs per group)
    for (const groupId of groupIds) {
      const groupBlogCount = randomInt(1, 3);
      for (let j = 0; j < groupBlogCount; j++) {
        const blogId = id();
        blogIds.push(blogId);

        // Create blog entity
        transactions.push(
          tx.blogs[blogId].update({
            title: faker.lorem.sentence(),
            date: faker.date.past({ years: 0.5 }).toISOString(),
            likeCount: randomInt(5, 100),
            commentCount: randomInt(0, 50),
            visibility: randomVisibility(),
          })
        );

        // Link blog to group
        transactions.push(tx.blogs[blogId].link({ group: groupId }));
        groupLinks++;

        // Create Owner and Writer roles for this blog
        const ownerRole = createBlogRole(blogId, 'Owner');
        const writerRole = createBlogRole(blogId, 'Writer');
        transactions.push(...ownerRole.transactions, ...writerRole.transactions);

        // Assign main user as Owner
        transactions.push(assignUserToBlog(blogId, mainUserId, ownerRole.roleId));
        userLinks++;

        // Always assign Tobias as Writer to this blog
        if (tobiasUserId && userIds.includes(tobiasUserId)) {
          transactions.push(assignUserToBlog(blogId, tobiasUserId, writerRole.roleId));
          userLinks++;
        }

        // Decide if this blog should have additional bloggers (70% chance)
        const shouldAddBloggers = Math.random() < 0.7;
        
        if (shouldAddBloggers && userIds.length > 2) {
          // Select 1-3 random users (excluding main user and Tobias)
          const availableUsers = userIds.filter(uid => uid !== mainUserId && uid !== tobiasUserId);
          const numBloggers = Math.min(randomInt(1, 3), availableUsers.length);
          const selectedUsers = faker.helpers.shuffle(availableUsers).slice(0, numBloggers);
          
          // Assign users with 50/50 Owner/Writer distribution
          selectedUsers.forEach((userId, index) => {
            const roleToUse = index % 2 === 0 ? ownerRole.roleId : writerRole.roleId;
            transactions.push(assignUserToBlog(blogId, userId, roleToUse));
            userLinks++;
          });
        }

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
    console.log(`  - User links: ${userLinks}`);
    console.log(`  - Group links: ${groupLinks}`);
    console.log(`  - Blog roles created: ${rolesCreated}`);

    return {
      ...context,
      blogIds,
      blogRoleIds,
      linkCounts: {
        ...context.linkCounts,
        blogsToUsers: (context.linkCounts?.blogsToUsers || 0) + userLinks,
        blogsToGroups: (context.linkCounts?.blogsToGroups || 0) + groupLinks,
      },
    };
  },
};
