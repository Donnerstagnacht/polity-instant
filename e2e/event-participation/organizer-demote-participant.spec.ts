// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Demote', () => {
  test('Organizer can demote organizer to participant', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });
    // Create another organizer to demote
    const otherOrganizer = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, otherOrganizer.id, event.organizerRoleId, 'confirmed');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find organizer and click "Demote to Participant"
    const demoteButton = page
      .getByRole('button', { name: /demote.*participant|remove.*organizer/i })
      .first();
    await expect(demoteButton).toBeVisible();

    await demoteButton.click();

    // 4. Verify role changed to "Participant"
    const participantLabel = page.locator('text=/^participant$/i').first();
    await expect(participantLabel).toBeVisible();
  });
});
