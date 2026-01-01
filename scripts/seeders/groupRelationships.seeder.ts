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
    let parentGroupLinks = 0;
    let childGroupLinks = 0;
    let requestedRelationships = 0;
    let activeRelationships = 0;

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
    const addAmendmentRelationship = (parentId: string, childId: string, isRequested: boolean = false) => {
      const relationshipId = id();
      groupRelationshipIds.push(relationshipId);
      
      const relationshipData: any = {
        relationshipType: 'isParent',
        withRight: 'amendmentRight',
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: new Date(),
      };
      
      if (isRequested) {
        relationshipData.status = 'requested';
        relationshipData.initiatorGroupId = parentId; // Parent initiates the request
        requestedRelationships++;
      } else {
        activeRelationships++;
      }
      
      transactions.push(
        tx.groupRelationships[relationshipId]
          .update(relationshipData)
          .link({ parentGroup: parentId, childGroup: childId })
      );
      totalRelationships++;
      amendmentRightChains++;
      parentGroupLinks++;
      childGroupLinks++;
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
        activeRelationships++;
        parentGroupLinks++;
        childGroupLinks++;
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
      activeRelationships++;
      parentGroupLinks++;
      childGroupLinks++;

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
      activeRelationships++;
      parentGroupLinks++;
      childGroupLinks++;

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
        activeRelationships++;
        parentGroupLinks++;
        childGroupLinks++;
      }
    } else if (groupIds.length >= 5) {
      // For smaller group counts
      addAmendmentRelationship(groupIds[3], groupIds[4]);
      addAmendmentRelationship(groupIds[0], groupIds[3]);
      addAmendmentRelationship(groupIds[1], groupIds[4]);
    }

    // Phase 4: Create relationship requests for testing
    // Each group should have at least 1 incoming and 1 outgoing request
    console.log('Creating relationship requests...');
    
    if (groupIds.length >= 3) {
      // Create various types of requested relationships with different rights
      const requestableRights = ['informationRight', 'rightToSpeak', 'activeVotingRight', 'passiveVotingRight'];
      
      // Ensure each group gets at least 1 outgoing and 1 incoming request
      for (let i = 0; i < groupIds.length; i++) {
        const currentGroupId = groupIds[i];
        
        // Create 1 outgoing request (current group as parent/initiator)
        const outgoingTargetIdx = (i + 2) % groupIds.length;
        if (outgoingTargetIdx !== i) {
          const outgoingRight = randomItem(requestableRights);
          const relationshipId = id();
          groupRelationshipIds.push(relationshipId);
          transactions.push(
            tx.groupRelationships[relationshipId]
              .update({
                relationshipType: 'isParent',
                withRight: outgoingRight,
                status: 'requested',
                initiatorGroupId: currentGroupId,
                createdAt: faker.date.past({ years: 0.1 }),
                updatedAt: new Date(),
              })
              .link({ parentGroup: currentGroupId, childGroup: groupIds[outgoingTargetIdx] })
          );
          totalRelationships++;
          requestedRelationships++;
          parentGroupLinks++;
          childGroupLinks++;
        }
        
        // Create 1 incoming request (current group as child, other as parent/initiator)
        const incomingSourceIdx = (i + 3) % groupIds.length;
        if (incomingSourceIdx !== i && incomingSourceIdx !== outgoingTargetIdx) {
          const incomingRight = randomItem(requestableRights);
          const relationshipId = id();
          groupRelationshipIds.push(relationshipId);
          transactions.push(
            tx.groupRelationships[relationshipId]
              .update({
                relationshipType: 'isParent',
                withRight: incomingRight,
                status: 'requested',
                initiatorGroupId: groupIds[incomingSourceIdx], // Other group initiated
                createdAt: faker.date.past({ years: 0.1 }),
                updatedAt: new Date(),
              })
              .link({ parentGroup: groupIds[incomingSourceIdx], childGroup: currentGroupId })
          );
          totalRelationships++;
          requestedRelationships++;
          parentGroupLinks++;
          childGroupLinks++;
        }
      }
      
      // Add a few more complex requests with multiple rights to the same pair
      if (groupIds.length >= 5) {
        const multiRequestPairs = [
          { parent: 0, child: 2 },
          { parent: 1, child: 3 },
        ];
        
        for (const pair of multiRequestPairs) {
          if (groupIds[pair.parent] && groupIds[pair.child]) {
            const rightsToRequest = randomItems(requestableRights, randomInt(2, 3));
            for (const right of rightsToRequest) {
              const relationshipId = id();
              groupRelationshipIds.push(relationshipId);
              transactions.push(
                tx.groupRelationships[relationshipId]
                  .update({
                    relationshipType: 'isParent',
                    withRight: right,
                    status: 'requested',
                    initiatorGroupId: groupIds[pair.parent],
                    createdAt: faker.date.past({ years: 0.05 }),
                    updatedAt: new Date(),
                  })
                  .link({ parentGroup: groupIds[pair.parent], childGroup: groupIds[pair.child] })
              );
              totalRelationships++;
              requestedRelationships++;
              parentGroupLinks++;
              childGroupLinks++;
            }
          }
        }
      }
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
    console.log(`  - Active relationships: ${activeRelationships}`);
    console.log(`  - Requested relationships: ${requestedRelationships}`);
    console.log(`✓ Created ${amendmentRightChains} amendmentRight relationships for filtering`);
    console.log(
      `✓ AmendmentRight connections per group: min=${minConnections}, max=${maxConnections}`
    );
    console.log(`  - Parent group links: ${parentGroupLinks}`);
    console.log(`  - Child group links: ${childGroupLinks}`);

    return {
      ...context,
      groupRelationshipIds,
      linkCounts: {
        ...context.linkCounts,
        groupRelationshipsToParentGroups:
          (context.linkCounts?.groupRelationshipsToParentGroups || 0) + parentGroupLinks,
        groupRelationshipsToChildGroups:
          (context.linkCounts?.groupRelationshipsToChildGroups || 0) + childGroupLinks,
      },
    };
  },
};
