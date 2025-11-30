import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Group', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Groups entity type
    const groupsOption = page
      .locator('text=Groups')
      .or(page.locator('[data-entity="groups"]'))
      .first();
    await groupsOption.click();

    // Wait for name field to appear
    await page.waitForTimeout(500);

    // Enter group name
    const nameInput = page.locator('input[name="name"]').or(page.getByPlaceholder(/name/i)).first();
    await nameInput.fill('Tech Community Berlin');

    // Advance carousel or click next
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter description
    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByPlaceholder(/description/i))
      .first();
    await descriptionInput.fill('A community for tech enthusiasts in Berlin');

    // Advance to visibility
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select visibility (public)
    const publicOption = page.locator('text=Public').or(page.locator('[value="public"]')).first();
    if (await publicOption.isVisible()) {
      await publicOption.click();
    }

    // Add hashtags
    const hashtagInput = page
      .locator('input[name="hashtags"]')
      .or(page.getByPlaceholder(/tag/i))
      .first();
    if (await hashtagInput.isVisible()) {
      await hashtagInput.fill('#tech #berlin');
      await page.keyboard.press('Enter');
    }

    // Click Create Group button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for navigation or success message
    await page.waitForURL(/\/group\//, { timeout: 5000 }).catch(() => {
      return;
    });

    // Verify success (either URL change or success message)
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
