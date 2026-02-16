import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - Loading States', () => {
  test('Bloggers page renders after loading', async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.testBlog1}/bloggers`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.testBlog1}/bloggers`);
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Bloggers list or empty state shown', async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.testBlog1}/bloggers`);
    await page.waitForLoadState('networkidle');

    const hasBloggers = await page
      .locator('[class*="member"], [class*="blogger"], [class*="card"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmptyState = await page
      .getByText(/no bloggers|invite.*blogger/i)
      .isVisible()
      .catch(() => false);
    const hasInviteButton = await page
      .getByRole('button', { name: /invite|add/i })
      .isVisible()
      .catch(() => false);

    expect(hasBloggers || hasEmptyState || hasInviteButton).toBeTruthy();
  });
});
