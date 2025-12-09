/**
 * Meeting Slots Seeder
 * Seeds meeting slots and bookings for users
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';

export const meetingSlotsSeeder: EntitySeeder = {
  name: 'meetingSlots',
  dependencies: ['users'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];

    console.log('Seeding meeting slots and bookings...');
    const transactions = [];
    let totalSlots = 0;
    let totalBookings = 0;

    // Link counters
    let meetingSlotsToOwners = 0;
    let meetingBookingsToSlots = 0;
    let meetingBookingsToBookers = 0;

    const meetingSlotIds: string[] = [];
    const bookingIds: string[] = [];

    for (const userId of userIds) {
      const now = new Date();

      // Create 5-8 available time slots in the next week
      const availableSlotsCount = randomInt(5, 8);
      for (let i = 0; i < availableSlotsCount; i++) {
        const slotId = id();
        meetingSlotIds.push(slotId);
        const daysAhead = randomInt(0, 7);
        const startTime = new Date(now);
        startTime.setDate(startTime.getDate() + daysAhead);
        startTime.setHours(randomInt(9, 16), randomInt(0, 3) * 15, 0, 0);
        const duration = randomInt(30, 90);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

        transactions.push(
          tx.meetingSlots[slotId]
            .update({
              startTime,
              endTime,
              isPublic: false,
              isAvailable: true,
              title: `1-on-1 Meeting`,
              description: 'Available for booking',
              meetingType: 'one-on-one',
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
            })
            .link({ owner: userId })
        );
        meetingSlotsToOwners++;
        totalSlots++;
      }

      // Create 3-5 booked time slots in the next week
      const bookedSlotsCount = randomInt(3, 5);
      for (let i = 0; i < bookedSlotsCount; i++) {
        const slotId = id();
        meetingSlotIds.push(slotId);
        const daysAhead = randomInt(0, 7);
        const startTime = new Date(now);
        startTime.setDate(startTime.getDate() + daysAhead);
        startTime.setHours(randomInt(9, 16), randomInt(0, 3) * 15, 0, 0);
        const duration = randomInt(30, 90);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        const bookerId = randomItem(userIds.filter(uid => uid !== userId));

        transactions.push(
          tx.meetingSlots[slotId]
            .update({
              startTime,
              endTime,
              isPublic: false,
              isAvailable: false,
              title: `1-on-1 Meeting`,
              description: 'Booked',
              meetingType: 'one-on-one',
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
            })
            .link({ owner: userId })
        );
        meetingSlotsToOwners++;
        totalSlots++;

        const bookingId = id();
        bookingIds.push(bookingId);
        transactions.push(
          tx.meetingBookings[bookingId]
            .update({
              status: 'confirmed',
              notes: faker.lorem.sentence(),
              createdAt: faker.date.past({ years: 0.04 }),
              updatedAt: new Date(),
            })
            .link({ slot: slotId, booker: bookerId })
        );
        meetingBookingsToSlots++;
        meetingBookingsToBookers++;
        totalBookings++;
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

    console.log(`✓ Created ${totalSlots} meeting slots with ${totalBookings} bookings`);
    console.log(`  Each user has 5-8 available slots and 3-5 booked slots`);
    console.log(`  - Meeting slot-to-owner links: ${meetingSlotsToOwners}`);
    console.log(`  - Meeting booking-to-slot links: ${meetingBookingsToSlots}`);
    console.log(`  - Meeting booking-to-booker links: ${meetingBookingsToBookers}`);

    return {
      ...context,
      meetingSlotIds,
      bookingIds,
      linkCounts: {
        ...context.linkCounts,
        meetingSlotsToOwners:
          (context.linkCounts?.meetingSlotsToOwners || 0) + meetingSlotsToOwners,
        meetingBookingsToSlots:
          (context.linkCounts?.meetingBookingsToSlots || 0) + meetingBookingsToSlots,
        meetingBookingsToBookers:
          (context.linkCounts?.meetingBookingsToBookers || 0) + meetingBookingsToBookers,
      },
    };
  },
};
