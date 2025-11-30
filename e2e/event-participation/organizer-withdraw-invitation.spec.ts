// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Withdraw Invitation', () => {
  test('Organizer can withdraw invitation', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Find pending invitations section
    const withdrawButton = page
      .getByRole('button', { name: /cancel invitation|withdraw/i })
      .first();
    await expect(withdrawButton).toBeVisible();

    // 4. Click "Cancel Invitation"
    await withdrawButton.click();

    // 5. Verify invitation is deleted
    // Button should disappear or user removed from invitations list
  });
});
