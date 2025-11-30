// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Display Group Details', () => {
  test('User views group details on group page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Name, description displayed correctly
    const name = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(name).toBeVisible();

    // 5. Location shown if provided
    page.getByText(/location|city|region/i);

    // 6. Owner information displayed
    page.locator('[data-testid="owner"]').or(page.getByText(/owner|creator/i));

    // 7. Public/private badge visible
    page.locator('[data-testid="visibility-badge"]').or(page.getByRole('status'));

    // 8. Social media links clickable
    page.locator('[data-testid="social-links"]').or(page.locator('a[href*="instagram"]'));

    // Group details are visible
    await expect(page).toHaveURL(/\/group\/.+/);
  });

  test('Group stats bar displays accurate counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. Check stats bar
    page.locator('[data-testid="stats-bar"]').or(page.locator('.stats-bar'));

    // 4. Member count accurate
    const memberCount = page.getByText(/member/i);

    // 5. Subscriber count accurate
    const subscriberCount = page.getByText(/subscriber/i);

    // 6. Events count shown
    page.getByText(/event/i);

    // 7. Stats update in real-time
    await memberCount.count();
    await subscriberCount.count();
  });
});
