// spec: e2e/test-plans/statements-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Statements - Create Public Statement', () => {
  test('User creates public statement with tag and text', async ({ authenticatedPage: page }) => {
    // Navigate to statement creation page
    await page.goto('/create/statement');
    await page.waitForLoadState('domcontentloaded');

    // Step 1: Enter statement text
    const textInput = page.locator('#statement-text');
    await textInput.fill('We need urgent action on climate change');

    // Go to next step
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    // Step 2: Enter tag and visibility
    const tagInput = page.locator('#statement-tag');
    await tagInput.fill('Climate Change');

    // Go to next step (review)
    await nextButton.click();

    // Step 3: Review and create
    const createButton = page.getByRole('button', { name: /create/i });
    await createButton.click();

    // Verify redirect to statement page
    await page.waitForURL(/\/statement\/.+/, { timeout: 10000 });

    // Verify statement details displayed
    await expect(page.getByText('We need urgent action on climate change')).toBeVisible();
    await expect(page.getByText('Climate Change').first()).toBeVisible();
  });
});
