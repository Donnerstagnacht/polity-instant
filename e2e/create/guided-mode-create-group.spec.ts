import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Group', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    // Step 0: Name + Description (both on same step)
    await page.locator('#group-name').fill('Tech Community Berlin');
    await page.locator('#group-description').fill('A community for tech enthusiasts in Berlin');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Navigate through steps 0→1→2→3→4→5 (5 clicks to reach review)
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }

    // Step 5: Review - Click Create Group
    const createButton = page.getByRole('button', { name: /create group/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for redirect to group page
    await page.waitForURL(/\/group\//, { timeout: 10000 }).catch(() => {});

    const isRedirected = page.url().includes('/group/');
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);
    expect(isRedirected || successMessage).toBeTruthy();
  });
});
