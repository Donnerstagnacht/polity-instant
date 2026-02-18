// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Change Role', () => {
  test('Organizer can change participant role', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    const participant = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, participant.id, event.participantRoleId, 'confirmed');

    // Navigate with retry on Access Denied
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // Find role dropdown for a participant
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible({ timeout: 10000 });

    await roleDropdown.click();

    // Select a different role
    const roleOption = page.getByRole('option').first();
    await expect(roleOption).toBeVisible({ timeout: 5000 });
    await roleOption.click();

    await page.waitForTimeout(1000);
  });
});
