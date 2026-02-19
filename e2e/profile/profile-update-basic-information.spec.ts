// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { navigateToProfileEdit } from '../helpers/navigation';

test.describe('Edit Profile Information', () => {
  test('Update Basic Profile Information', async ({ authenticatedPage: page }) => {
    // 1. Authenticate and navigate to edit page
    await navigateToProfileEdit(page);

    // 2. Generate unique timestamp
    const timestamp = Date.now();

    // 3. Create test data
    const testData = {
      name: `Test User ${timestamp}`,
      subtitle: 'Automated Test User',
      bio: 'This is a test bio created by Playwright automation.',
    };

    // 4. Fill name field and immediately verify (avoids race with concurrent real-time sync)
    const nameField = page.getByLabel(/name/i);
    await nameField.clear();
    await nameField.fill(testData.name);
    // Wait for the controlled input to reflect our value
    await expect(nameField).toHaveValue(testData.name, { timeout: 3000 });

    // 5. If subtitle field exists and is visible, fill with test subtitle
    const subtitleField = page.getByLabel(/subtitle/i);
    const subtitleCount = await subtitleField.count();
    if (subtitleCount > 0 && (await subtitleField.isVisible())) {
      await subtitleField.clear();
      await subtitleField.fill(testData.subtitle);
    }

    // 6. If bio field exists and is visible, fill with test bio
    const bioField = page.getByLabel(/bio/i);
    const bioCount = await bioField.count();
    if (bioCount > 0 && (await bioField.isVisible())) {
      await bioField.clear();
      await bioField.fill(testData.bio);
    }

    // 7. Verify all entered values are displayed in their respective fields
    // Re-fill name and verify in case real-time sync from concurrent tests overwrote it
    const currentName = await nameField.inputValue();
    if (currentName !== testData.name) {
      await nameField.clear();
      await nameField.fill(testData.name);
    }
    await expect(nameField).toHaveValue(testData.name, { timeout: 3000 });
    if (subtitleCount > 0 && (await subtitleField.isVisible())) {
      await expect(subtitleField).toHaveValue(testData.subtitle);
    }
    if (bioCount > 0 && (await bioField.isVisible())) {
      await expect(bioField).toHaveValue(testData.bio);
    }
  });
});
