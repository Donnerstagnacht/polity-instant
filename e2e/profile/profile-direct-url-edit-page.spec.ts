// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('Navigation and URL Handling', () => {
  test('Direct URL Access to Edit Page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate using loginAsTestUser(page)
    // 2. Get current user ID from URL after navigating to profile
    await navigateToOwnProfile(page);
    const currentUrl = page.url();
    const userIdMatch = currentUrl.match(/\/user\/([a-f0-9-]+)/);
    expect(userIdMatch).toBeTruthy();
    if (!userIdMatch) throw new Error('User ID not found in URL');
    const userId = userIdMatch[1];

    // 3. Navigate directly to /user/{userId}/edit
    await page.goto(`/user/${userId}/edit`);
    await page.waitForLoadState('domcontentloaded');

    // 4. Verify edit page loads
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+\/edit/);

    // 5. Verify form fields are populated with current user data
    const nameField = page.getByLabel(/name/i);
    await expect(nameField).toBeVisible({ timeout: 10000 });

    const nameValue = await nameField.inputValue();
    expect(nameValue).toBeTruthy();
    expect(nameValue.length).toBeGreaterThan(0);
  });
});
