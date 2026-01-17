// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToOwnProfile } from '../helpers/navigation';

test.describe('Responsive Behavior and Visual Elements', () => {
  test('Verify Avatar Display on Profile', async ({ page }) => {
    // 1. Authenticate and navigate to own profile
    await loginAsTestUser(page);
    await navigateToOwnProfile(page);

    // 2. Locate avatar in main content area
    const avatar = page.locator('main img').first();

    // 3. Verify avatar is visible
    await expect(avatar).toBeVisible();

    // 4. Check avatar image src attribute is not empty
    const srcAttr = await avatar.getAttribute('src');
    expect(srcAttr).toBeTruthy();
    expect(srcAttr).not.toBe('');

    // 5. Verify avatar has appropriate alt text for accessibility
    const altAttr = await avatar.getAttribute('alt');
    expect(altAttr).toBeTruthy();
    expect(altAttr?.length).toBeGreaterThan(0);
  });
});
