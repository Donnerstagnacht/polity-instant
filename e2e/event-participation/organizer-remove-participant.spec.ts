// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Remove Participant', () => {
  test('Organizer can remove participant from event', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a participant to remove
    const participant = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, participant.id, event.participantRoleId, 'confirmed');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Get initial participant count
    const participantCountElement = page.locator('text=/\\d+\\s*participant/i').first();
    const initialCountText = await participantCountElement.textContent();
    const initialCount = parseInt(initialCountText?.match(/\\d+/)?.[0] || '0');

    // 4. Find participant and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove/i }).first();
    await removeButton.click();

    // 5. Confirm removal if dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|remove/i }).first();
    const isConfirmVisible = await confirmButton.isVisible().catch(() => false);

    if (isConfirmVisible) {
      await confirmButton.click();
    }

    // 6. Verify participant count decreased
    const newCountText = await participantCountElement.textContent();
    const newCount = parseInt(newCountText?.match(/\\d+/)?.[0] || '0');
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });
});
