// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('Edit Profile Information', () => {
  test('Navigate to Profile Edit Page', async ({ page }) => {
    // 1. Use loginAsTestUser(page) to authenticate
    await loginAsTestUser(page);

    // 2. Use navigateToOwnProfile(page) helper
    await navigateToOwnProfile(page);

    // 3. Locate edit link in sidebar (icon-only link)
    const editLink = page.locator('a[href*="/edit"]').first();

    // 4. Click the edit link
    await editLink.click();

    // 5. Verify URL matches pattern /user/[a-f0-9-]+/edit
    await expect(page).toHaveURL(/\/user\/[a-f0-9-]+\/edit/);

    // 6. Verify heading containing "edit" (case insensitive) is visible
    const heading = page.getByRole('heading', { name: /edit/i });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // 7. Verify name input field with label matching /name/i is visible
    const nameInput = page.getByLabel(/name/i);
    await expect(nameInput).toBeVisible();
  });
});
