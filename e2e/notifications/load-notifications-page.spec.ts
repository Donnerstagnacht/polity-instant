// spec: e2e/test-plans/notifications-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Notifications - Load Notifications Page', () => {
  test('User accesses the notifications page', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to /notifications
    await page.goto('/notifications');

    // 3. Verify page loads with notification list
    await expect(page.getByRole('heading', { name: /notifications/i })).toBeVisible();

    // 4. Tabs visible for "All", "Unread", "Read"
    await expect(page.getByRole('tab', { name: /all/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /unread/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /read/i })).toBeVisible();

    // 5. Verify page layout
    const allTab = page.getByRole('tab', { name: /all/i });
    await expect(allTab).toBeVisible();
  });
});
