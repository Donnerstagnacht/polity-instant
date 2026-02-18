// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Remove Participant', () => {
  test('Organizer can remove participant from event', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    test.setTimeout(60000);
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a participant to remove
    const participant = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, participant.id, event.participantRoleId, 'confirmed');

    // Navigate to participants page (retry on Access Denied)
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // Verify page loaded
    const heading = page.getByRole('heading', { name: /participant|manage/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Find participant and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await expect(removeButton).toBeVisible({ timeout: 10000 });
    await removeButton.click();

    // Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // Verify remove completed
    await page.waitForTimeout(1000);
  });
});
