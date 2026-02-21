/**
 * Support Confirmations Seeder
 * Seeds support confirmation requests for groups supporting amendments
 */

import { id } from '../helpers/id.helper';
import { tx } from '../helpers/compat';
import { batchTransact } from '../helpers/transaction.helpers';
import type { InsertOp } from '../helpers/transaction.helpers';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const supportConfirmationsSeeder: EntitySeeder = {
  name: 'supportConfirmations',
  dependencies: ['users', 'groups', 'amendments'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const groupIds = context.groupIds || [];

    console.log('Seeding support confirmations...');
    const transactions: InsertOp[] = [];
    let totalConfirmations = 0;

    // Query amendments with group supporters, change requests, and documents
    const { data: amendmentRows } = await db.from('amendments').select('*');
    const { data: changeRequestRows } = await db.from('changeRequests').select('*');
    const { data: documentRows } = await db.from('amendmentDocuments').select('*');

    // Group change requests by amendment
    const changeRequestsByAmendment = new Map<string, any[]>();
    for (const cr of changeRequestRows || []) {
      const key = cr.amendmentId || cr.amendmentVoteId;
      if (!key) continue;
      const list = changeRequestsByAmendment.get(key) || [];
      list.push(cr);
      changeRequestsByAmendment.set(key, list);
    }

    // Map documents by amendment
    const documentByAmendment = new Map<string, any>();
    for (const doc of documentRows || []) {
      if (doc.amendmentId) documentByAmendment.set(doc.amendmentId, doc);
    }

    // Build enriched amendments (groupSupportersId is a single FK from compat layer)
    const amendmentsWithSupporters = (amendmentRows || [])
      .filter((a: any) => a.groupSupportersId)
      .map((a: any) => ({
        ...a,
        groupSupporters: [{ id: a.groupSupportersId }],
        changeRequests: changeRequestsByAmendment.get(a.id) || [],
        document: documentByAmendment.get(a.id),
      }))
      .filter((a: any) => a.changeRequests.length > 0);

    const confirmationStatuses = ['pending', 'confirmed', 'declined'];

    // Create support confirmations for some amendments
    const amendmentsToProcess = randomItems(
      amendmentsWithSupporters,
      Math.min(amendmentsWithSupporters.length, randomInt(3, 10))
    );

    for (const amendment of amendmentsToProcess as any[]) {
      const supportingGroups = amendment.groupSupporters || [];
      const changeRequests = amendment.changeRequests || [];

      if (supportingGroups.length === 0 || changeRequests.length === 0) continue;

      // Pick a random change request that triggered the confirmation
      const changeRequest = randomItem(changeRequests) as any;

      // Create confirmations for each supporting group
      for (const group of supportingGroups as any[]) {
        // Only create confirmations for some groups
        if (faker.datatype.boolean(0.6)) {
          const confirmationId = id();
          const status = randomItem(confirmationStatuses);
          const createdAt = faker.date.recent({ days: 14 }).getTime();

          const confirmationTx = tx.supportConfirmations[confirmationId]
            .update({
              status,
              changeRequestId: changeRequest.id,
              originalVersion: amendment.document?.content || {},
              createdAt,
              respondedAt:
                status !== 'pending' ? createdAt + randomInt(3600000, 86400000 * 3) : undefined,
            })
            .link({
              amendment: amendment.id,
              group: group.id,
              changeRequest: changeRequest.id,
            });

          transactions.push(confirmationTx);
          totalConfirmations++;
        }
      }
    }

    // Execute transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await batchTransact(db, batch);
    }

    console.log(`  Created ${totalConfirmations} support confirmations`);

    return context;
  },
};
