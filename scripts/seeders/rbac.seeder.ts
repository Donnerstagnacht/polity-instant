/**
 * RBAC Seeder
 * Seeds Role-Based Access Control entities:
 * - Event roles, action rights, and participants
 * - Amendment roles and action rights
 * - Blog roles, action rights, and bloggers
 * Note: Group roles are created in the groups seeder
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { DEFAULT_EVENT_ROLES, DEFAULT_BLOG_ROLES } from '../../db/rbac/constants';
import { SEED_CONFIG } from '../config/seed.config';

export const rbacSeeder: EntitySeeder = {
  name: 'rbac',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const eventIds = context.eventIds || [];
    const tobiasUserId = SEED_CONFIG.tobiasUserId;
    const blogIds = context.blogIds || [];
    const eventOrganizers = context.eventOrganizers || new Map<string, string>();

    console.log('Seeding RBAC entities (roles, actionRights, participants, bloggers)...');
    const transactions = [];
    let totalRoles = 0;
    let totalActionRights = 0;
    let totalParticipants = 0;
    let totalBloggers = 0;

    // Link tracking counters
    let rolesToEvents = 0;
    let rolesToAmendments = 0;
    let rolesToBlogs = 0;
    let actionRightsToRoles = 0;
    let actionRightsToEvents = 0;
    let actionRightsToAmendments = 0;
    let actionRightsToBlogs = 0;
    let eventParticipantsToEvents = 0;
    let eventParticipantsToUsers = 0;
    let eventParticipantsToRoles = 0;
    let blogBloggersToBlogs = 0;
    let blogBloggersToUsers = 0;
    let blogBloggersToRoles = 0;

    const roleIds: string[] = [];
    const actionRightIds: string[] = [];
    const bloggerIds: string[] = [];
    const eventRoleMappings = new Map<string, { organizerId: string; participantId: string }>();

    // 1. Create event-level roles and participants
    for (const eventId of eventIds) {
      const eventRoleIds: Record<string, string> = {};

      // Create event-level roles from constants
      for (const roleDef of DEFAULT_EVENT_ROLES) {
        const roleId = id();
        roleIds.push(roleId);
        eventRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: 'event',
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ event: eventId })
        );
        totalRoles++;
        rolesToEvents++;

        // Create action rights for this role
        for (const perm of roleDef.permissions) {
          const actionRightId = id();
          actionRightIds.push(actionRightId);
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [roleId], event: eventId })
          );
          totalActionRights++;
          actionRightsToRoles++;
          actionRightsToEvents++;
        }
      }

      // Create participants with roles
      const participantCount = randomInt(3, 8);
      const participantUsers = randomItems(userIds, participantCount);

      const organizerRoleId = eventRoleIds['Organizer'];
      const participantRoleId = eventRoleIds['Participant'];

      // Store role mappings for use by other seeders
      eventRoleMappings.set(eventId, {
        organizerId: organizerRoleId,
        participantId: participantRoleId,
      });

      // Ensure event organizer is a participant with Organizer role
      const eventOrganizerId = eventOrganizers.get(eventId);
      const usersWithRoles = new Set<string>();

      if (eventOrganizerId) {
        const organizerParticipantId = id();
        transactions.push(
          tx.eventParticipants[organizerParticipantId]
            .update({
              status: 'member',
              createdAt: faker.date.past({ years: 0.3 }),
              visibility: randomVisibility(),
            })
            .link({
              event: eventId,
              user: eventOrganizerId,
              role: organizerRoleId,
            })
        );
        totalParticipants++;
        eventParticipantsToEvents++;
        eventParticipantsToUsers++;
        eventParticipantsToRoles++;
        usersWithRoles.add(eventOrganizerId);
      }

      // Add Tobias as a participant to ALL events
      if (tobiasUserId && !usersWithRoles.has(tobiasUserId)) {
        const tobiasParticipantId = id();
        transactions.push(
          tx.eventParticipants[tobiasParticipantId]
            .update({
              status: 'member',
              createdAt: faker.date.past({ years: 0.3 }),
              visibility: 'public',
            })
            .link({
              event: eventId,
              user: tobiasUserId,
              role: participantRoleId,
            })
        );
        totalParticipants++;
        eventParticipantsToEvents++;
        eventParticipantsToUsers++;
        eventParticipantsToRoles++;
        usersWithRoles.add(tobiasUserId);
      }

      for (let i = 0; i < participantUsers.length; i++) {
        const userId = participantUsers[i];

        // Skip if user is already the event organizer
        if (usersWithRoles.has(userId)) {
          continue;
        }

        const participantId = id();

        // Assign roles: first 1-2 users are co-organizers, rest are participants
        let roleId;
        if (i < randomInt(1, 3)) {
          roleId = organizerRoleId; // 1-2 co-organizers
        } else {
          roleId = participantRoleId;
        }

        // Organizers always have 'member' status, participants can be member/invited/requested
        const status =
          roleId === organizerRoleId
            ? ('member' as const)
            : randomItem(['member', 'member', 'member', 'invited', 'requested'] as const);

        transactions.push(
          tx.eventParticipants[participantId]
            .update({
              status,
              createdAt: faker.date.past({ years: 0.3 }),
              visibility: randomVisibility(),
            })
            .link({
              event: eventId,
              user: userId,
              role: roleId,
            })
        );
        totalParticipants++;
        eventParticipantsToEvents++;
        eventParticipantsToUsers++;
        eventParticipantsToRoles++;
      }
    }

    // 2. Create amendment-level roles - REMOVED (Moved to amendments.seeder.ts)

    // 3. Create blog-level roles and bloggers
    for (const blogId of blogIds) {
      const blogRoleIds: Record<string, string> = {};

      // Create blog-level roles from constants
      for (const roleDef of DEFAULT_BLOG_ROLES) {
        const roleId = id();
        roleIds.push(roleId);
        blogRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: 'blog',
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ blog: blogId })
        );
        totalRoles++;
        rolesToBlogs++;

        // Create action rights for this role
        for (const perm of roleDef.permissions) {
          const actionRightId = id();
          actionRightIds.push(actionRightId);
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [roleId], blog: blogId })
          );
          totalActionRights++;
          actionRightsToRoles++;
          actionRightsToBlogs++;
        }
      }

      // Create bloggers with roles (1 owner, 1-3 writers)
      const bloggerCount = randomInt(2, 4);
      const bloggerUsers = randomItems(userIds, bloggerCount);

      const ownerRoleId = blogRoleIds['Owner'];
      const writerRoleId = blogRoleIds['Writer'];

      for (let i = 0; i < bloggerUsers.length; i++) {
        const userId = bloggerUsers[i];
        const bloggerId = id();
        bloggerIds.push(bloggerId);

        // Assign roles: first is Owner, rest are Writers
        let roleId;
        if (i === 0) {
          roleId = ownerRoleId;
        } else {
          roleId = writerRoleId;
        }

        transactions.push(
          tx.blogBloggers[bloggerId]
            .update({
              status: 'member',
              createdAt: faker.date.past({ years: 0.3 }),
              visibility: randomVisibility(),
            })
            .link({
              blog: blogId,
              user: userId,
              role: roleId,
            })
        );
        totalBloggers++;
        blogBloggersToBlogs++;
        blogBloggersToUsers++;
        blogBloggersToRoles++;
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

    console.log(`✓ Created ${totalRoles} roles (event-level and blog-level)`);
    console.log(`✓ Created ${totalActionRights} action rights with RBAC permissions`);
    console.log(`✓ Created ${totalParticipants} event participants with role assignments`);
    console.log(`✓ Created ${totalBloggers} blog bloggers with role assignments`);
    console.log(`  - Each event has 2 roles: Organizer, Participant`);
    console.log(`  - Each blog has 2 roles: Owner, Writer`);

    return {
      ...context,
      roleIds,
      actionRightIds,
      bloggerIds,
      eventRoleMappings,
      linkCounts: {
        ...(context.linkCounts || {}),
        rolesToEvents,
        rolesToAmendments,
        rolesToBlogs,
        actionRightsToRoles,
        actionRightsToEvents,
        actionRightsToAmendments,
        actionRightsToBlogs,
        eventParticipantsToEvents,
        eventParticipantsToUsers,
        eventParticipantsToRoles,
        blogBloggersToBlogs,
        blogBloggersToUsers,
        blogBloggersToRoles,
      },
    };
  },
};
