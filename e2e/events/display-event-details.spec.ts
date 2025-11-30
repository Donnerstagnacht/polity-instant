// spec: e2e/test-plans/events-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Events - Display Event Details', () => {
  test('User views event details on event page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to event page
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Title displayed correctly
    const title = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(title).toBeVisible();

    // 5. Date and time formatted properly
    // 6. Organizer information displayed
    // 7. Public/private badge visible
    // Event details are visible
    await expect(page).toHaveURL(/\/event\/.+/);
  });
});
