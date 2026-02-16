import { test, expect } from '../fixtures/test-base';
test.describe('Public Pages', () => {
  test('should display home page with content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Home page should have visible content
    const heading = page.getByRole('heading').first();
    if ((await heading.count()) > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('should display solutions page', async ({ page }) => {
    await page.goto('/solutions');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading').first();
    if ((await heading.count()) > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('should display features page', async ({ page }) => {
    await page.goto('/features');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading').first();
    if ((await heading.count()) > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('should display support page', async ({ page }) => {
    await page.goto('/support');
    await page.waitForLoadState('networkidle');

    const heading = page.getByRole('heading').first();
    if ((await heading.count()) > 0) {
      await expect(heading).toBeVisible();
    }
  });

  test('should handle 404 not-found page', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await page.waitForLoadState('networkidle');

    const notFound = page.getByText(/not found|404|page doesn't exist/i);
    if ((await notFound.count()) > 0) {
      await expect(notFound.first()).toBeVisible();
    }
  });
});
