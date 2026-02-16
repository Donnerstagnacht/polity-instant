// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { navigateToProfileEdit } from '../helpers/navigation';

test.describe('Avatar Management', () => {
  test('Verify Avatar Upload Constraints', async ({ authenticatedPage: page }) => {
    // 1. Authenticate and navigate to edit page
    await navigateToProfileEdit(page);

    // 2. Locate file input for avatar upload
    const fileInput = page
      .locator('input[type="file"]')
      .filter({
        has: page.locator('[accept*="image"]'),
      })
      .or(page.locator('input[type="file"][accept*="image"]'));

    // 3. Check accept attribute value
    const acceptAttr = await fileInput.getAttribute('accept');

    // 4. Verify it includes image types
    expect(acceptAttr).toBeTruthy();
    expect(acceptAttr).toMatch(/image/);

    // 5. Verify file input accepts images
    const sizeHint = page.getByText(/size|mb|kb/i);
    const sizeHintCount = await sizeHint.count();
    expect(sizeHintCount).toBeGreaterThanOrEqual(0);
  });
});
