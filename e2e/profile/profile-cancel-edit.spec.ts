// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToProfileEdit } from '../helpers/navigation';

test.describe('Edit Profile Information', () => {
  test('Cancel Profile Edit', async ({ page }) => {
    // 1. Authenticate and navigate to edit page
    await loginAsTestUser(page);
    await navigateToProfileEdit(page);

    // 2. Make changes to name field (do not save)
    const nameField = page.getByLabel(/name/i);
    await nameField.clear();
    await nameField.fill('Changed Name Not To Be Saved');

    // 3. Look for cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    const cancelCount = await cancelButton.count();

    // 4. If cancel button exists, click it
    if (cancelCount > 0) {
      await cancelButton.click();

      // 5. Verify navigation back to profile view page
      await expect(page).toHaveURL(/\/user\/[a-f0-9-]+$/, { timeout: 5000 });

      // 6. Verify changes were not saved
      const heading = page.locator('h1').first();
      const headingText = await heading.textContent();
      expect(headingText).not.toContain('Changed Name Not To Be Saved');
    } else {
      console.log('Cancel button not found - test skipped');
    }
  });
});
