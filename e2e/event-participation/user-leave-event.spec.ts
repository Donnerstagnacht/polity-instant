// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Leave Event', () => {
  test('Participant can leave event', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    // Create event owned by another user, add test user as participant
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });
    await eventFactory.addParticipant(event.id, mainUserId, event.participantRoleId, 'confirmed');

    // Navigate to event page
    await gotoWithRetry(page, `/event/${event.id}`);

    // Wait for the participation button to appear
    const leaveButton = page.getByRole('button', { name: /leave event/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    await expect(leaveButton.or(acceptButton)).toBeVisible({ timeout: 15000 });

    const isParticipant = await leaveButton.isVisible().catch(() => false);

    if (!isParticipant) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible({ timeout: 10000 });
    }

    // Click "Leave Event" button
    await leaveButton.click();

    // Verify button changes to "Request to Participate"
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible({ timeout: 10000 });
  });
});
