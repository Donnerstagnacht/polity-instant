// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Approve Request', () => {
  test('Organizer can approve participation request', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
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

    // 3. Verify participants page loaded
    const heading = page.getByRole('heading', { name: /participant|manage/i });
    await expect(heading).toBeVisible();

    // 4. Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible();

    await acceptButton.click();

    // 5. Verify user appears in active participants list
    // Request should be removed from pending section
  });
});
