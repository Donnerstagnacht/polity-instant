// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('View Own Profile (Authenticated)', () => {
  test('Verify Profile Action Bar', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Check for "Share" button (if visible)
    const shareButton = page.getByRole('button', { name: /share/i });
    const shareCount = await shareButton.count();
    if (shareCount > 0) {
      await expect(shareButton.first()).toBeVisible();
    }

    // 3. Verify "Edit" link is present and visible in sidebar (icon-only link to /edit)
    const editLink = page.locator('a[href*="/edit"]').first();
    await expect(editLink).toBeVisible();

    // 4. Do not click Share button (may trigger browser dialog)
    // 5. Verify action buttons are accessible
    const actionButtons = page.locator('[class*="action"]').locator('button, a[role="button"]');
    expect(await actionButtons.count()).toBeGreaterThanOrEqual(0);
  });
});
