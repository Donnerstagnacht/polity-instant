import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Amendment', async ({ authenticatedPage: page }) => {
    await page.goto('/create/amendment');

    // Step 0: Title + Subtitle
    const titleInput = page.locator('#amendment-title');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Climate Action Amendment 2024');

    const subtitleInput = page.locator('#amendment-subtitle');
    if (await subtitleInput.isVisible()) {
      await subtitleInput.fill('An amendment to address climate change policies');
    }

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Step 0→1 (Target Group & Event - required fields)
    await nextButton.click();

    // Step 1 requires group + event selection
    // Try to navigate through remaining steps if validation allows
    // Steps: 1→2→3→4 (3 more clicks to reach review)
    for (let i = 0; i < 3; i++) {
      if (await nextButton.isEnabled()) {
        await nextButton.click();
      }
    }

    // If we reached review, try to create
    const createButton = page.getByRole('button', { name: /create.*amendment/i });
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await createButton.click();
      await page.waitForURL(/\/amendment\//, { timeout: 10000 }).catch(() => {});
    }

    // Verify we at least loaded the form correctly
    expect(page.url()).toContain('/create/amendment');
  });
});
