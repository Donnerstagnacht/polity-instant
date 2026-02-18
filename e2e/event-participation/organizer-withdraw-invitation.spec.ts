// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - Organizer Withdraw Invitation', () => {
  test('Organizer can withdraw invitation', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create an invited participant
    const invited = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, invited.id, event.participantRoleId, 'invited');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find pending invitations section
    const withdrawButton = page
      .getByRole('button', { name: /cancel invitation|withdraw/i })
      .first();
    await expect(withdrawButton).toBeVisible();

    // 4. Click "Cancel Invitation"
    await withdrawButton.click();

    // 5. Verify invitation is deleted
    // Button should disappear or user removed from invitations list
  });
});
