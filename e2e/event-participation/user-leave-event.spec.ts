// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Leave Event', () => {
  test('Participant can leave event', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    // Create event owned by another user, add test user as participant
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await eventFactory.addParticipant(event.id, testUser.id, event.participantRoleId, 'confirmed');

    // 1. Authenticate as test user
    // 2. Navigate to event where user is a participant
    await page.goto(`/event/${event.id}`);

    // 3. Ensure user is a participant
    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });

    const isParticipant = await leaveButton.isVisible().catch(() => false);

    if (!isParticipant) {
      await acceptButton.click();
      await expect(leaveButton).toBeVisible();
    }

    // 4. Click "Leave Event" button
    await leaveButton.click();

    // 5. Verify button changes to "Request to Participate"
    const requestButton = page.getByRole('button', { name: /request to participate/i });
    await expect(requestButton).toBeVisible();
  });
});
