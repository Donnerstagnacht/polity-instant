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

export const rbacSeeder: EntitySeeder = {
  name: 'rbac',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];
    const blogIds = context.blogIds || [];

    console.log('Seeding RBAC entities (roles, actionRights, participants, bloggers)...');
    const transactions = [];
    let totalRoles = 0;
    let totalActionRights = 0;
    let totalParticipants = 0;
    let totalBloggers = 0;

    const roleIds: string[] = [];
    const actionRightIds: string[] = [];
    const bloggerIds: string[] = [];

    // Define common roles for events
    const eventRoleDefinitions = [
      {
        name: 'Organizer',
        description: 'Event organizer with full permissions',
        scope: 'event' as const,
      },
      { name: 'Participant', description: 'Regular event participant', scope: 'event' as const },
    ];

    // Define common roles for amendments
    const amendmentRoleDefinitions = [
      {
        name: 'Applicant',
        description: 'Amendment applicant with administrative access',
        scope: 'amendment' as const,
      },
      { name: 'Collaborator', description: 'Amendment collaborator', scope: 'amendment' as const },
    ];

    // Define common roles for blogs
    const blogRoleDefinitions = [
      { name: 'Owner', description: 'Blog owner with full permissions', scope: 'blog' as const },
      { name: 'Writer', description: 'Blog writer with edit access', scope: 'blog' as const },
    ];

    // 1. Create event-level roles and participants
    for (const eventId of eventIds) {
      const eventRoleIds: Record<string, string> = {};

      // Create event-level roles
      for (const roleDef of eventRoleDefinitions) {
        const roleId = id();
        roleIds.push(roleId);
        eventRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: roleDef.scope,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ event: eventId })
        );
        totalRoles++;
      }

      // Create action rights for Organizer role (full event control)
      const organizerRoleId = eventRoleIds['Organizer'];
      const organizerActions = ['update', 'delete', 'manage_participants'];
      for (const action of organizerActions) {
        const actionRightId = id();
        actionRightIds.push(actionRightId);
        transactions.push(
          tx.actionRights[actionRightId]
            .update({
              resource: 'events',
              action,
            })
            .link({ roles: [organizerRoleId], event: eventId })
        );
        totalActionRights++;
      }

      // Add action rights for Organizer to manage participants
      const manageParticipantsRight = id();
      actionRightIds.push(manageParticipantsRight);
      transactions.push(
        tx.actionRights[manageParticipantsRight]
          .update({
            resource: 'eventParticipants',
            action: 'manage',
          })
          .link({ roles: [organizerRoleId], event: eventId })
      );
      totalActionRights++;

      // Add manageNotifications right to Organizer role
      const manageNotificationsRight = id();
      actionRightIds.push(manageNotificationsRight);
      transactions.push(
        tx.actionRights[manageNotificationsRight]
          .update({
            resource: 'notifications',
            action: 'manageNotifications',
          })
          .link({ roles: [organizerRoleId], event: eventId })
      );
      totalActionRights++;

      // Create action rights for Participant role (read access)
      const participantRoleId = eventRoleIds['Participant'];
      const actionRightId = id();
      actionRightIds.push(actionRightId);
      transactions.push(
        tx.actionRights[actionRightId]
          .update({
            resource: 'events',
            action: 'read',
          })
          .link({ roles: [participantRoleId], event: eventId })
      );
      totalActionRights++;

      // Create participants with roles
      const participantCount = randomInt(3, 8);
      const participantUsers = randomItems(userIds, participantCount);

      for (let i = 0; i < participantUsers.length; i++) {
        const userId = participantUsers[i];
        const participantId = id();

        // Assign roles: first is Organizer, rest are Participants
        let roleId;
        if (i === 0) {
          roleId = organizerRoleId;
        } else {
          roleId = participantRoleId;
        }

        transactions.push(
          tx.participants[participantId]
            .update({
              status: randomItem(['accepted', 'accepted', 'accepted', 'pending', 'invited']),
            })
            .link({
              event: eventId,
              user: userId,
              role: roleId,
            })
        );
        totalParticipants++;
      }
    }

    // 2. Create amendment-level roles
    for (const amendmentId of amendmentIds) {
      const amendmentRoleIds: Record<string, string> = {};

      // Create amendment-level roles
      for (const roleDef of amendmentRoleDefinitions) {
        const roleId = id();
        roleIds.push(roleId);
        amendmentRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: roleDef.scope,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ amendment: amendmentId })
        );
        totalRoles++;
      }

      // Create action rights for Applicant role (full amendment control)
      const applicantRoleId = amendmentRoleIds['Applicant'];
      const applicantActions = ['update', 'delete'];
      for (const action of applicantActions) {
        const actionRightIdAR = id();
        actionRightIds.push(actionRightIdAR);
        transactions.push(
          tx.actionRights[actionRightIdAR]
            .update({
              resource: 'amendments',
              action,
            })
            .link({ roles: [applicantRoleId], amendment: amendmentId })
        );
        totalActionRights++;
      }

      // Add manage permission for amendment collaborators to Applicant role
      const manageCollaboratorsRight = id();
      actionRightIds.push(manageCollaboratorsRight);
      transactions.push(
        tx.actionRights[manageCollaboratorsRight]
          .update({
            resource: 'amendmentCollaborators',
            action: 'manage',
          })
          .link({ roles: [applicantRoleId], amendment: amendmentId })
      );
      totalActionRights++;

      // Add manageNotifications right to Applicant role
      const manageAmendmentNotificationsRight = id();
      actionRightIds.push(manageAmendmentNotificationsRight);
      transactions.push(
        tx.actionRights[manageAmendmentNotificationsRight]
          .update({
            resource: 'notifications',
            action: 'manageNotifications',
          })
          .link({ roles: [applicantRoleId], amendment: amendmentId })
      );
      totalActionRights++;

      // Create action rights for Collaborator role (read and comment access)
      const collaboratorRoleId = amendmentRoleIds['Collaborator'];
      const collaboratorActions = ['read', 'update'];
      for (const action of collaboratorActions) {
        const collaboratorActionId = id();
        actionRightIds.push(collaboratorActionId);
        transactions.push(
          tx.actionRights[collaboratorActionId]
            .update({
              resource: 'amendments',
              action,
            })
            .link({ roles: [collaboratorRoleId], amendment: amendmentId })
        );
        totalActionRights++;
      }
    }

    // 3. Create blog-level roles and bloggers
    for (const blogId of blogIds) {
      const blogRoleIds: Record<string, string> = {};

      // Create blog-level roles
      for (const roleDef of blogRoleDefinitions) {
        const roleId = id();
        roleIds.push(roleId);
        blogRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: roleDef.scope,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ blog: blogId })
        );
        totalRoles++;
      }

      // Create action rights for Owner role (full blog control)
      const ownerRoleId = blogRoleIds['Owner'];
      const ownerActions = ['update', 'delete'];
      for (const action of ownerActions) {
        const actionRightIdBlog = id();
        actionRightIds.push(actionRightIdBlog);
        transactions.push(
          tx.actionRights[actionRightIdBlog]
            .update({
              resource: 'blogs',
              action,
            })
            .link({ roles: [ownerRoleId], blog: blogId })
        );
        totalActionRights++;
      }

      // Add manageNotifications right to Owner role
      const manageBlogNotificationsRight = id();
      actionRightIds.push(manageBlogNotificationsRight);
      transactions.push(
        tx.actionRights[manageBlogNotificationsRight]
          .update({
            resource: 'notifications',
            action: 'manageNotifications',
          })
          .link({ roles: [ownerRoleId], blog: blogId })
      );
      totalActionRights++;

      // Create action rights for Writer role (update and delete access)
      const writerRoleId = blogRoleIds['Writer'];
      const writerActions = ['update', 'delete'];
      for (const action of writerActions) {
        const writerActionId = id();
        actionRightIds.push(writerActionId);
        transactions.push(
          tx.actionRights[writerActionId]
            .update({
              resource: 'blogs',
              action,
            })
            .link({ roles: [writerRoleId], blog: blogId })
        );
        totalActionRights++;
      }

      // Create bloggers with roles (1 owner, 1-3 writers)
      const bloggerCount = randomInt(2, 4);
      const bloggerUsers = randomItems(userIds, bloggerCount);

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

    console.log(`✓ Created ${totalRoles} roles (event-level, amendment-level, and blog-level)`);
    console.log(`✓ Created ${totalActionRights} action rights with RBAC permissions`);
    console.log(`✓ Created ${totalParticipants} event participants with role assignments`);
    console.log(`✓ Created ${totalBloggers} blog bloggers with role assignments`);
    console.log(`  - Each event has 2 roles: Organizer, Participant`);
    console.log(`  - Each amendment has 2 roles: Applicant, Collaborator`);
    console.log(`  - Each blog has 2 roles: Owner, Writer`);

    return { ...context, roleIds, actionRightIds, bloggerIds };
  },
};
