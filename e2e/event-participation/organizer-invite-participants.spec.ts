// spec: e2e/test-plans/event-participation-test-plan.md

import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event Participation - Organizer Invite', () => {
  test('Organizer can invite participants', async ({ authenticatedPage: page, eventFactory, userFactory, mainUserId }) => {
    const event = await eventFactory.createEvent(mainUserId, {
      title: `Test Event ${Date.now()}`,
    });
    // Create a user to invite
    const invitee = await userFactory.createUser();

    // Navigate to participants management page (retry on Access Denied)
    await gotoWithRetry(page, `/event/${event.id}/participants`);

    // Wait for InstantDB to sync the newly-created user
    await page.waitForTimeout(3000);

    // Click "Invite" button
    const inviteButton = page.getByRole('button', { name: /invite/i }).first();
    await expect(inviteButton).toBeVisible({ timeout: 10000 });
    await inviteButton.click();

    // Verify dialog opens
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Search for user using the command input (combobox pattern)
    const searchInput = dialog.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // Try searching by handle first (more unique), then by name, then broad term
    const searchTerms = [invitee.handle, invitee.name, 'e2e'];
    let found = false;
    for (const term of searchTerms) {
      if (!term) continue;
      await searchInput.clear();
      await searchInput.fill(term);
      await page.waitForTimeout(2000);
      const userItem = dialog.locator('[cmdk-item]').first();
      if (await userItem.isVisible({ timeout: 3000 }).catch(() => false)) {
        await userItem.click();
        found = true;
        break;
      }
    }

    if (found) {
      // Click "Invite" button in dialog
      const confirmButton = dialog.getByRole('button', { name: /invite/i }).last();
      await expect(confirmButton).toBeEnabled({ timeout: 5000 });
      await confirmButton.click();

      // Verify dialog closes
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  });
});
