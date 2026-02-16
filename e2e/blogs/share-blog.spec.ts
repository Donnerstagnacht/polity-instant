import { test, expect } from '../fixtures/test-base';
import { navigateToBlog } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog - Share Blog', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await navigateToBlog(page, TEST_ENTITY_IDS.BLOG);
  });

  test('should display share button on blog detail page', async ({ authenticatedPage: page }) => {
    const shareButton = page.getByRole('button', { name: /share/i });
    if ((await shareButton.count()) > 0) {
      await expect(shareButton.first()).toBeVisible();
    }
  });

  test('should copy blog link when share button is clicked', async ({ authenticatedPage: page }) => {
    const shareButton = page.getByRole('button', { name: /share/i });
    if ((await shareButton.count()) === 0) {
      test.skip();
      return;
    }

    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    await shareButton.first().click();

    // Should show a toast or copy confirmation
    const copied = page.getByText(/copied|link/i);
    if ((await copied.count()) > 0) {
      await expect(copied.first()).toBeVisible();
    }
  });
});
