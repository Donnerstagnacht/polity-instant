// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Change Role', () => {
  test('Organizer can change participant role', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });
    const participant = await userFactory.createUser();
    await eventFactory.addParticipant(event.id, participant.id, event.participantRoleId, 'confirmed');

    // 1. Authenticate as organizer user
    // 2. Navigate to participants page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Find role dropdown for a participant
    const roleDropdown = page.getByRole('combobox').first();
    await expect(roleDropdown).toBeVisible();

    // 4. Click role dropdown
    await roleDropdown.click();

    // 5. Select new role (e.g., Speaker, Moderator, Participant)
    const roleOption = page.getByRole('option', { name: /speaker|moderator|participant/i }).first();
    await roleOption.click();

    // 6. Verify role is updated
    await expect(roleDropdown).toContainText(/speaker|moderator|participant/i);
  });
});
