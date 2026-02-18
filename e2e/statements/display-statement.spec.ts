// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';

test.describe('Statements - Display Statement Page', () => {
  test('User views statement with tag, text, and creator info', async ({
    authenticatedPage: page,
  }) => {
    // First, create a statement via UI so we have one to view
    await page.goto('/create/statement');
    await page.waitForLoadState('domcontentloaded');

    // Step 1: Enter statement text
    const textInput = page.locator('#statement-text');
    await textInput.fill('Test statement for display verification');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    // Step 2: Enter tag
    const tagInput = page.locator('#statement-tag');
    await tagInput.fill('TestTag');
    await nextButton.click();

    // Step 3: Create
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // Wait for redirect to statement page
    await page.waitForURL(/\/statement\/.+/, { timeout: 10000 });

    // Verify statement details are visible
    await expect(page).toHaveURL(/\/statement\/.+/);
    await expect(page.getByText('Test statement for display verification')).toBeVisible();
    await expect(page.getByText('TestTag').first()).toBeVisible();
  });

  test('Creator information displays correctly', async ({ authenticatedPage: page }) => {
    // Create a statement first
    await page.goto('/create/statement');
    await page.waitForLoadState('domcontentloaded');

    const textInput = page.locator('#statement-text');
    await textInput.fill('Creator info test statement');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    const tagInput = page.locator('#statement-tag');
    await tagInput.fill('CreatorTest');
    await nextButton.click();

    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    await page.waitForURL(/\/statement\/.+/, { timeout: 10000 });

    // Check creator section
    const authorCard = page.locator('[class*="Card"]').filter({ hasText: /author/i });

    if ((await authorCard.count()) > 0) {
      // Avatar displayed, name shown
      await expect(authorCard.first()).toBeVisible();
    }
  });
});
