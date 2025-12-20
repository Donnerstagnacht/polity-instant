import { id, tx } from '@instantdb/admin';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const delegatesSeeder: EntitySeeder = {
  name: 'delegates',
  dependencies: ['events', 'groups', 'users', 'groupRelationships'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding delegates for delegate conferences...');
    const { db, eventIds, groupIds, userIds } = context;
    const transactions = [];
    let delegatesCreated = 0;
    let allocationsCreated = 0;

    // Query events to find delegate conferences
    const eventsData = await db.query({
      events: {
        group: {},
      },
    });

    const delegateConferences = eventsData.events.filter(
      (e: any) => e.eventType === 'delegate_conference' && e.group?.[0]?.id
    );

    console.log(`Found ${delegateConferences.length} delegate conferences to seed`);

    for (const event of delegateConferences) {
      const parentGroupId = event.group[0]?.id;

      // Query group relationships to find subgroups
      const relationshipsData = await db.query({
        groupRelationships: {
          $: {
            where: {
              'parentGroup.id': parentGroupId,
            },
          },
          childGroup: {},
          parentGroup: {},
        },
      });

      const subgroups = relationshipsData.groupRelationships.map((rel: any) => ({
        id: rel.childGroup[0]?.id,
        name: rel.childGroup[0]?.name,
        memberCount: rel.childGroup[0]?.memberCount || 0,
      })).filter((g: any) => g.id); // Filter out any with undefined id

      if (subgroups.length === 0) {
        console.log(`  Skipping event ${event.id} - no subgroups found`);
        continue;
      }

      // Calculate delegate allocations (1 delegate per 50 members)
      const totalMembers = subgroups.reduce((sum: number, g: any) => sum + g.memberCount, 0);
      const totalDelegates = Math.max(1, Math.floor(totalMembers / 50));

      // Simple proportional allocation
      const allocations = subgroups.map((subgroup: any) => {
        const proportion = totalMembers > 0 ? subgroup.memberCount / totalMembers : 0;
        const allocated = Math.max(1, Math.round(proportion * totalDelegates));
        return {
          ...subgroup,
          allocatedDelegates: allocated,
        };
      });

      console.log(`  Event ${event.title}: ${allocations.length} subgroups, ${totalDelegates} total delegates`);

      // Create groupDelegateAllocations
      for (const allocation of allocations) {
        const allocationId = id();
        transactions.push(
          tx.groupDelegateAllocations[allocationId].update({
            allocatedDelegates: allocation.allocatedDelegates,
            memberCount: allocation.memberCount,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );
        transactions.push(
          tx.groupDelegateAllocations[allocationId].link({
            event: event.id,
            group: allocation.id,
          })
        );
        allocationsCreated++;
      }

      // Create nominated delegates for each subgroup
      for (const allocation of allocations) {
        // Get members of this subgroup
        const membersData = await db.query({
          groupMemberships: {
            $: {
              where: {
                and: [
                  { 'group.id': allocation.id },
                  { status: 'member' },
                ],
              },
            },
            user: {},
          },
        });

        const members = membersData.groupMemberships
          .map((m: any) => m.user?.[0]?.id)
          .filter(Boolean);

        if (members.length === 0) {
          console.log(`    Skipping ${allocation.name} - no members`);
          continue;
        }

        // Nominate 1.5x the allocated number (to allow for standby delegates)
        const nominationCount = Math.min(
          Math.ceil(allocation.allocatedDelegates * 1.5),
          members.length
        );
        const nominees = randomItems(members, nominationCount);

        console.log(`    ${allocation.name}: nominating ${nominationCount} delegates (${allocation.allocatedDelegates} allocated)`);

        for (let priority = 1; priority <= nominees.length; priority++) {
          const userId = nominees[priority - 1] as string;
          const delegateId = id();

          transactions.push(
            tx.eventDelegates[delegateId].update({
              priority,
              status: 'nominated',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          );
          transactions.push(
            tx.eventDelegates[delegateId].link({
              event: event.id,
              user: userId,
              group: allocation.id,
            })
          );
          delegatesCreated++;
        }
      }
    }

    // Batch transact all delegate data
    if (transactions.length > 0) {
      await batchTransact(db, transactions, 50);
      console.log(
        `✓ Created ${delegatesCreated} delegate nominations and ${allocationsCreated} allocations`
      );
    }

    return context;
  },
};
