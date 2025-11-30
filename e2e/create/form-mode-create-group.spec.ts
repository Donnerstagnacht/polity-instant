import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Form Mode - Create Group', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Switch to form mode
    const modeToggle = page
      .locator('[data-testid="mode-toggle"]')
      .or(page.getByRole('switch'))
      .first();
    await modeToggle.click();

    await page.waitForTimeout(500);

    // Click Groups tab
    const groupsTab = page
      .locator('[role="tab"]:has-text("Groups")')
      .or(page.locator('button:has-text("Groups")').first());
    if (await groupsTab.isVisible()) {
      await groupsTab.click();
    }

    // Fill in all group fields simultaneously
    const nameInput = page.locator('input[name="name"]').or(page.getByLabel(/name/i)).first();
    await nameInput.fill('Innovation Hub Berlin');

    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByLabel(/description/i))
      .first();
    await descriptionInput.fill('A hub for innovators and entrepreneurs');

    // Select visibility
    const visibilitySelect = page
      .locator('select[name="visibility"]')
      .or(page.locator('[data-testid="visibility-select"]'))
      .first();
    if (await visibilitySelect.isVisible()) {
      await visibilitySelect.selectOption('public');
    } else {
      const publicRadio = page.locator('input[value="public"]').first();
      if (await publicRadio.isVisible()) {
        await publicRadio.click();
      }
    }

    // Add hashtags
    const hashtagInput = page
      .locator('input[name="hashtags"]')
      .or(page.getByPlaceholder(/tag/i))
      .first();
    if (await hashtagInput.isVisible()) {
      await hashtagInput.fill('#innovation #startups');
      await page.keyboard.press('Enter');
    }

    // Click Create Group button
    const createButton = page
      .locator('button:has-text("Create Group")')
      .or(page.locator('button:has-text("Create")'))
      .first();
    await createButton.click();

    // Wait for navigation or success
    await page.waitForURL(/\/group\//, { timeout: 5000 }).catch(() => {
      return;
    });

    // Verify success
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
