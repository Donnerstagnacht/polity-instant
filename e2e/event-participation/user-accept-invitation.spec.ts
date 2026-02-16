// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Accept Invitation', () => {
  test('User can accept event invitation', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    // Create event owned by another user, invite the test user
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });
    const testUser = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    await eventFactory.addParticipant(event.id, testUser.id, event.participantRoleId, 'invited');

    // 1. Authenticate as test user
    // 2. Navigate to event page where user is invited
    await page.goto(`/event/${event.id}`);

    // 3. Verify "Accept Invitation" button is visible
    const acceptButton = page.getByRole('button', { name: /accept invitation|accept/i });
    await expect(acceptButton).toBeVisible();

    // 4. Click "Accept Invitation" button
    await acceptButton.click();

    // 5. Verify button changes to "Leave Event"
    const leaveButton = page.getByRole('button', { name: /leave event|leave/i });
    await expect(leaveButton).toBeVisible();
  });
});
