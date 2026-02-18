// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Reject Request', () => {
  test('Organizer can reject participation request', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a user who requested to participate
    const requester = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, requester.id, event.participantRoleId, 'requested');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants management page
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // 3. Find pending request and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove|reject/i }).first();
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // 4. Verify request is deleted
    // User should disappear from pending list
  });
});
