// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Event Participation - Organizer Promote', () => {
  test('Organizer can promote participant to organizer', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a participant to promote
    const participant = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, participant.id, event.participantRoleId, 'confirmed');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find participant and click "Promote to Organizer"
    const promoteButton = page
      .getByRole('button', { name: /promote.*organizer|make.*organizer/i })
      .first();
    await expect(promoteButton).toBeVisible();

    await promoteButton.click();

    // 4. Verify participant's role changed to "Organizer"
    const organizerLabel = page.locator('text=/organizer/i').first();
    await expect(organizerLabel).toBeVisible();
  });
});
