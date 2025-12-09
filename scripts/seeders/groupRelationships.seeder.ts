/**
 * Group Relationships Seeder
 * Creates hierarchical relationships between groups (parent/child)
 * with various rights (amendmentRight, informationRight, etc.)
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const groupRelationshipsSeeder: EntitySeeder = {
  name: 'groupRelationships',
  dependencies: ['groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const groupIds = context.groupIds || [];

    if (groupIds.length < 3) {
      console.log('⚠️  Not enough groups to create relationships');
      return context;
    }

    console.log('Seeding group relationships...');
    const transactions = [];
    let totalRelationships = 0;
    let amendmentRightChains = 0;
    const groupRelationshipIds: string[] = [];

    const rights = [
      'informationRight',
      'amendmentRight',
      'rightToSpeak',
      'activeVotingRight',
      'passiveVotingRight',
    ];

    // Track amendmentRight connections per group (both parent and child)
    const amendmentConnections = new Map<string, number>();
    groupIds.forEach(gid => amendmentConnections.set(gid, 0));

    // Helper to add an amendmentRight relationship
    const addAmendmentRelationship = (parentId: string, childId: string) => {
      const relationshipId = id();
      groupRelationshipIds.push(relationshipId);
      transactions.push(
        tx.groupRelationships[relationshipId]
          .update({
            relationshipType: 'isParent',
            withRight: 'amendmentRight',
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: parentId, childGroup: childId })
      );
      totalRelationships++;
      amendmentRightChains++;
      amendmentConnections.set(parentId, (amendmentConnections.get(parentId) || 0) + 1);
      amendmentConnections.set(childId, (amendmentConnections.get(childId) || 0) + 1);
    };

    // Phase 1: Create core amendmentRight chains
    for (let i = 0; i < Math.min(groupIds.length - 1, 7); i++) {
      addAmendmentRelationship(groupIds[i], groupIds[i + 1]);

      // Also add some additional rights
      const additionalRights = randomItems(
        rights.filter(r => r !== 'amendmentRight'),
        randomInt(0, 2)
      );
      for (const right of additionalRights) {
        const relationshipId = id();
        groupRelationshipIds.push(relationshipId);
        transactions.push(
          tx.groupRelationships[relationshipId]
            .update({
              relationshipType: 'isParent',
              withRight: right,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ parentGroup: groupIds[i], childGroup: groupIds[i + 1] })
        );
        totalRelationships++;
      }
    }

    // Phase 2: Create cross-connections to ensure EVERY group has at least 2 amendmentRight connections
    if (groupIds.length >= 8) {
      // Group 0 -> Group 3
      addAmendmentRelationship(groupIds[0], groupIds[3]);
      // Group 0 -> Group 4
      addAmendmentRelationship(groupIds[0], groupIds[4]);
      // Group 1 -> Group 5
      addAmendmentRelationship(groupIds[1], groupIds[5]);
      // Group 2 -> Group 6
      addAmendmentRelationship(groupIds[2], groupIds[6]);
      // Group 3 -> Group 5
      addAmendmentRelationship(groupIds[3], groupIds[5]);
      // Group 3 -> Group 6
      addAmendmentRelationship(groupIds[3], groupIds[6]);
      // Group 4 -> Group 7
      addAmendmentRelationship(groupIds[4], groupIds[7]);
      // Group 3 -> Group 7
      addAmendmentRelationship(groupIds[3], groupIds[7]);
      // Group 2 -> Group 3
      addAmendmentRelationship(groupIds[2], groupIds[3]);

      // Ensure every group has at least 2 amendmentRight connections
      groupIds.forEach((groupId, idx) => {
        const currentConnections = amendmentConnections.get(groupId) || 0;
        if (currentConnections < 2) {
          const needed = 2 - currentConnections;
          for (let i = 0; i < needed; i++) {
            const potentialPartners = groupIds.filter(
              (otherId, otherIdx) =>
                otherId !== groupId && Math.abs(idx - otherIdx) > 0 && Math.abs(idx - otherIdx) <= 3
            );

            if (potentialPartners.length > 0) {
              const partner = randomItem(potentialPartners);
              const partnerIdx = groupIds.indexOf(partner);

              if (idx < partnerIdx) {
                addAmendmentRelationship(groupId, partner);
              } else {
                addAmendmentRelationship(partner, groupId);
              }
            }
          }
        }
      });

      // Add some non-amendmentRight relationships for variety
      const relationshipId3 = id();
      transactions.push(
        tx.groupRelationships[relationshipId3]
          .update({
            relationshipType: 'isParent',
            withRight: 'informationRight',
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[3] })
      );
      totalRelationships++;

      const relationshipId4 = id();
      transactions.push(
        tx.groupRelationships[relationshipId4]
          .update({
            relationshipType: 'isParent',
            withRight: 'rightToSpeak',
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[4] })
      );
      totalRelationships++;

      const multipleRights = randomItems(
        rights.filter(r => r !== 'amendmentRight'),
        randomInt(1, 2)
      );
      for (const right of multipleRights) {
        const relationshipId = id();
        groupRelationshipIds.push(relationshipId);
        transactions.push(
          tx.groupRelationships[relationshipId]
            .update({
              relationshipType: 'isParent',
              withRight: right,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ parentGroup: groupIds[2], childGroup: groupIds[6] })
        );
        totalRelationships++;
      }
    } else if (groupIds.length >= 5) {
      // For smaller group counts
      addAmendmentRelationship(groupIds[3], groupIds[4]);
      addAmendmentRelationship(groupIds[0], groupIds[3]);
      addAmendmentRelationship(groupIds[1], groupIds[4]);
    }

    if (transactions.length > 0) {
      await db.transact(transactions);
    }

    let minConnections = Infinity;
    let maxConnections = 0;
    amendmentConnections.forEach(count => {
      minConnections = Math.min(minConnections, count);
      maxConnections = Math.max(maxConnections, count);
    });

    console.log(
      `✓ Created ${totalRelationships} group relationships with complex network structure`
    );
    console.log(`✓ Created ${amendmentRightChains} amendmentRight relationships for filtering`);
    console.log(
      `✓ AmendmentRight connections per group: min=${minConnections}, max=${maxConnections}`
    );

    return { ...context, groupRelationshipIds };
  },
};
