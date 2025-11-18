// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { navigateToProfileEdit } from '../helpers/navigation';

test.describe('Edit Profile Information', () => {
  test('Update Contact Information', async ({ page }) => {
    // 1. Authenticate and navigate to edit page
    await loginAsTestUser(page);
    await navigateToProfileEdit(page);

    // 2. Update basic info
    const timestamp = Date.now();
    const nameField = page.getByLabel(/name/i);
    await nameField.clear();
    await nameField.fill(`Test User ${timestamp}`);

    // 3. Locate email field
    const emailField = page.getByLabel(/email/i);
    const emailCount = await emailField.count();

    // 4. If email field visible and editable, update to updated@test.com
    if (emailCount > 0 && (await emailField.isVisible())) {
      const isDisabled = await emailField.isDisabled();
      if (!isDisabled) {
        await emailField.clear();
        await emailField.fill('updated@test.com');
        await expect(emailField).toHaveValue('updated@test.com');
      }
    }

    // 5. Locate location field
    const locationField = page.getByLabel(/location/i);
    const locationCount = await locationField.count();

    // 6. If location field visible, fill with Test City, Test Country
    if (locationCount > 0 && (await locationField.isVisible())) {
      await locationField.clear();
      await locationField.fill('Test City, Test Country');

      // 7. Verify both fields accept and display entered values
      await expect(locationField).toHaveValue('Test City, Test Country');
    }
  });
});
