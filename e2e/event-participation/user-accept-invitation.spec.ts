// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Accept Invitation', () => {
  test('User can accept event invitation', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    // Create event owned by another user, invite the test user
    const owner = await userFactory.createUser();
    const event = await eventFactory.createEvent(owner.id, {
      title: `Test Event ${Date.now()}`,
    });
    await eventFactory.addParticipant(event.id, mainUserId, event.participantRoleId, 'invited');

    // 1. Authenticate as test user
    // 2. Navigate to event page where user is invited
    await gotoWithRetry(page, `/event/${event.id}`);

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
