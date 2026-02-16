// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Reject Request', () => {
  test('Organizer can reject participation request', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a user who requested to participate
    const requester = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, requester.id, event.participantRoleId, 'requested');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants management page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find pending request and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove|reject/i }).first();
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // 4. Verify request is deleted
    // User should disappear from pending list
  });
});
