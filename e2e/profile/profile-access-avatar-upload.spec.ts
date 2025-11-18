// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToProfileEdit } from '../helpers/navigation';

test.describe('Avatar Management', () => {
  test('Access Avatar Upload Interface', async ({ page }) => {
    // 1. Use loginAsTestUser(page) to authenticate
    await loginAsTestUser(page);

    // 2. Use navigateToProfileEdit(page) helper to open edit page
    await navigateToProfileEdit(page);

    // 3. Locate avatar upload label
    const avatarLabel = page.locator('label[for="avatar-upload"]');
    const labelCount = await avatarLabel.count();

    // 4. If label visible, verify it is displayed
    if (labelCount > 0) {
      await expect(avatarLabel).toBeVisible();
    }

    // 5. Locate file input
    const fileInput = page.locator('input[type="file"][accept*="image"]');

    // 6. Verify file input is attached to DOM
    await expect(fileInput).toBeAttached();

    // Verify accept attribute includes image types
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toMatch(/image/);
  });
});
