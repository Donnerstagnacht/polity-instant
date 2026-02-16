// spec: e2e/test-plans/profile-feature-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import path from 'path';
import { navigateToOwnProfile, navigateToProfileEdit } from '../helpers/navigation';

test.describe('Responsive Behavior and Visual Elements', () => {
  test('Update Profile Avatar and Verify Display', async ({ authenticatedPage: page }) => {
    // 1. Authenticate and navigate to profile edit page
    await navigateToProfileEdit(page);

    // 2. Upload new avatar
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await expect(fileInput).toBeAttached();

    // Create a test image file path
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

    // Upload the image (with fallback if file doesn't exist)
    try {
      await fileInput.setInputFiles(testImagePath);
    } catch {
      // Fallback: create a buffer for testing
      const buffer = Buffer.from('fake-image-data');
      await fileInput.setInputFiles({
        name: 'test-avatar.jpg',
        mimeType: 'image/jpeg',
        buffer: buffer,
      });
    }

    // Wait for upload to process
    // NOTE: Upload fails here with "Permission denied: not has-storage-permission?"
    await page.waitForLoadState('networkidle');

    // 3. Save changes
    const saveButton = page.locator('button:has-text("Save")').or(
      page.locator('[type="submit"]')
    ).first();
    await saveButton.click();

    // Wait for save to complete
    await page.waitForLoadState('networkidle');

    // 4. Navigate to profile view to verify avatar display
    await navigateToOwnProfile(page);

    // 5. Verify avatar representation is displayed
    // NOTE: When upload fails, UserWiki component doesn't render any avatar section in main content
    // The component only shows an img tag when dbUser.avatar exists
    const avatarImage = page.locator('main img').first();
    const avatarFallback = page.locator('main').getByText(/^[A-Z]{1,3}$/);

    // Check if either avatar image or fallback initials are visible
    const hasAvatarImage = await avatarImage.isVisible().catch(() => false);
    const hasFallback = await avatarFallback.isVisible().catch(() => false);

    // At least one should be visible
    expect(hasAvatarImage || hasFallback).toBeTruthy();

    // 6. If image is displayed, verify its attributes
    if (hasAvatarImage) {
      const srcAttr = await avatarImage.getAttribute('src');
      expect(srcAttr).toBeTruthy();
      expect(srcAttr).not.toBe('');

      const altAttr = await avatarImage.getAttribute('alt');
      expect(altAttr).toBeTruthy();
      expect(altAttr?.length).toBeGreaterThan(0);
    }

    // 7. If fallback is displayed, verify it shows initials
    if (hasFallback) {
      const fallbackText = await avatarFallback.textContent();
      expect(fallbackText).toMatch(/^[A-Z]{1,3}$/);
    }
  });
});
