// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Invite', () => {
  test('Organizer can invite participants', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants management page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

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
