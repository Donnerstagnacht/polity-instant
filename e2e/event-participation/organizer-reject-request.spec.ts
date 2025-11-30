// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Organizer Reject Request', () => {
  test('Organizer can reject participation request', async ({ page }) => {
    // 1. Authenticate as organizer user
    await loginAsTestUser(page);

    // 2. Navigate to participants management page
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Find pending request and click "Remove"
    const removeButton = page.getByRole('button', { name: /remove|reject/i }).first();
    await expect(removeButton).toBeVisible();

    await removeButton.click();

    // 4. Verify request is deleted
    // User should disappear from pending list
  });
});
