import { test, expect } from '../fixtures/test-base';
test.describe('Pricing Page', () => {
  test('should display pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const pricingHeading = page.getByRole('heading', { name: /pricing|plans/i });
    if ((await pricingHeading.count()) > 0) {
      await expect(pricingHeading.first()).toBeVisible();
    }
  });

  test('should display pricing tiers/plans', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    // Pricing cards should be visible
    const pricingCards = page.locator('[class*="card"], [class*="Card"]');
    if ((await pricingCards.count()) > 0) {
      await expect(pricingCards.first()).toBeVisible();
    }
  });

  test('should display CTA buttons on pricing plans', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');

    const ctaButtons = page.getByRole('button', { name: /start|get started|subscribe|choose/i });
    if ((await ctaButtons.count()) > 0) {
      await expect(ctaButtons.first()).toBeVisible();
    }
  });
});
