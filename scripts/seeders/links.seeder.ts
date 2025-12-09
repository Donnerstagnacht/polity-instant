import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const linksSeeder: EntitySeeder = {
  name: 'links',
  dependencies: ['groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding links...');
    const { db, groupIds } = context;
    const transactions = [];
    const linkIds: string[] = [];
    let totalLinks = 0;
    let linksToGroups = 0;

    const linkLabels = [
      'Website',
      'Facebook Page',
      'Twitter/X',
      'Instagram',
      'LinkedIn',
      'Discord Server',
      'Telegram Channel',
      'YouTube Channel',
      'GitHub Repository',
      'Newsletter',
      'Donation Page',
      'Meeting Calendar',
    ];

    const linkUrls = [
      'https://example.org',
      'https://facebook.com/example',
      'https://twitter.com/example',
      'https://instagram.com/example',
      'https://linkedin.com/company/example',
      'https://discord.gg/example',
      'https://t.me/example',
      'https://youtube.com/@example',
      'https://github.com/example',
      'https://example.org/newsletter',
      'https://donate.example.org',
      'https://calendar.example.org',
    ];

    for (const groupId of groupIds) {
      const numLinks = randomInt(2, 5);
      const selectedIndices = randomItems([...Array(linkLabels.length).keys()], numLinks);

      for (const idx of selectedIndices) {
        const linkId = id();
        linkIds.push(linkId);
        totalLinks++;

        transactions.push(
          tx.links[linkId]
            .update({
              label: linkLabels[idx],
              url: linkUrls[idx],
              createdAt: faker.date.past({ years: 1 }),
            })
            .link({ group: groupId })
        );
        linksToGroups++;
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${totalLinks} links`);
    console.log(`  - Link-to-group links: ${linksToGroups}`);

    return {
      ...context,
      linkIds,
      linkCounts: {
        ...context.linkCounts,
        linksToGroups: (context.linkCounts?.linksToGroups || 0) + linksToGroups,
      },
    };
  },
};
