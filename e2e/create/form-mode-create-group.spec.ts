import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Form Mode - Create Group', async ({ authenticatedPage: page }) => {
    await page.goto('/create/group');

    // Step 0: Name + Description
    await page.locator('#group-name').fill('Innovation Hub Berlin');
    await page.locator('#group-description').fill('A hub for innovators and entrepreneurs');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Navigate through all steps to review (5 clicks: 0→1→2→3→4→5)
    for (let i = 0; i < 5; i++) {
      await nextButton.click();
    }

    // Click Create Group
    const createButton = page.getByRole('button', { name: /create group/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for redirect
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
