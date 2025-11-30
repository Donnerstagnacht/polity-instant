// spec: e2e/test-plans/event-participation-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Participation - Access Control', () => {
  test('Non-organizer cannot access participants management page', async ({ page }) => {
    // 1. Authenticate as non-organizer user
    await loginAsTestUser(page);

    // 2. Try to access participants management page directly
    await page.goto(`/event/${TEST_ENTITY_IDS.testEvent1}/participants`);

    // 3. Verify access is denied
    const accessDenied = page.locator(
      'text=/access denied|unauthorized|forbidden|not authorized/i'
    );
    await expect(accessDenied).toBeVisible();
  });
});
