// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Approve Request', () => {
  test('Organizer can approve participation request', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a user who requested to participate
    const requester = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, requester.id, event.participantRoleId, 'requested');

    // Navigate to participants management page (retry on Access Denied)
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // Verify participants page loaded
    const heading = page.getByRole('heading', { name: /participant|manage/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Find first pending request and click "Accept"
    const acceptButton = page.getByRole('button', { name: /accept/i }).first();
    await expect(acceptButton).toBeVisible({ timeout: 10000 });

    await acceptButton.click();

    // Verify request is removed from pending section
    await expect(acceptButton).not.toBeVisible({ timeout: 5000 });
  });
});
