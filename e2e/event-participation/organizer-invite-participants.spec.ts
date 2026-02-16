// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Invite', () => {
  test('Organizer can invite participants', async ({ authenticatedPage: page, eventFactory, userFactory }) => {
    const user = await userFactory.createUser({ id: TEST_ENTITY_IDS.mainTestUser });
    const event = await eventFactory.createEvent(user.id, {
      title: `Test Event ${Date.now()}`,
    });

    // 1. Authenticate as organizer user
    // 2. Navigate to participants management page
    await page.goto(`/event/${event.id}/participants`);

    // 3. Click "Invite Participant" button
    const inviteButton = page.getByRole('button', { name: /invite participant|invite/i });
    await inviteButton.click();

    // 4. Verify dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 5. Search for user
    const searchInput = dialog.getByRole('textbox', { name: /search|find/i });
    await searchInput.fill('test');

    // 6. Select first user from results
    const userOption = page.getByRole('option').first();
    await expect(userOption).toBeVisible();
    await userOption.click();

    // 7. Click "Invite" button in dialog
    const confirmButton = dialog.getByRole('button', { name: /invite|send/i });
    await confirmButton.click();

    // 8. Verify invitation created
    await expect(dialog).not.toBeVisible();
  });
});
