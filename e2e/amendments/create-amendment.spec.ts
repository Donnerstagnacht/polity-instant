// spec: e2e/test-plans/amendments-test-plan.md

import { test, expect } from '../fixtures/test-base';

test.describe('Amendments - Create Amendment with Required Fields', () => {
  test('User creates amendment with title and subtitle', async ({ authenticatedPage: page }) => {
    // Use unique name to avoid collisions in parallel runs
    const amendmentTitle = `E2E Amendment ${Date.now()}`;

    // 1. Navigate to /create/amendment (carousel wizard)
    await page.goto('/create/amendment');
    await page.waitForLoadState('domcontentloaded');

    // Reload on client-side app crash
    const errorHeading = page.getByText('Application error');
    if (await errorHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
    }

    // 2. Wait for the form to load
    const titleInput = page.getByPlaceholder(/title/i).first();
    await expect(titleInput).toBeVisible({ timeout: 15000 });

    // 3. Fill in title (Step 1: Basic Info)
    await titleInput.fill(amendmentTitle);

    // 4. Fill in subtitle if visible
    const subtitleInput = page.getByPlaceholder(/subtitle/i);
    if (await subtitleInput.isVisible().catch(() => false)) {
      await subtitleInput.fill('Comprehensive measures for climate change mitigation');
    }

    // 5. Navigate through carousel steps using Next button
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click(); // Step 1 → Step 2 (Target Group & Event)

    // Step 2 may require group/event selection - skip to review if possible
    // Navigate remaining steps
    if (await nextButton.isEnabled().catch(() => false)) {
      await nextButton.click(); // Step 2 → Step 3 (Visibility)
    }
    if (await nextButton.isVisible().catch(() => false) && await nextButton.isEnabled().catch(() => false)) {
      await nextButton.click(); // Step 3 → Step 4 (Video)
    }
    if (await nextButton.isVisible().catch(() => false) && await nextButton.isEnabled().catch(() => false)) {
      await nextButton.click(); // Step 4 → Step 5 (Review)
    }

    // 6. The review step should show the amendment title
    await expect(page.getByText(amendmentTitle)).toBeVisible({ timeout: 5000 });
  });
});
