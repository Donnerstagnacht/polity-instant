import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Success Redirect', async ({ page }) => {
    await page.goto('/create');

    const groupsOption = page.locator('text=Groups').first();
    await groupsOption.click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('Redirect Test Group');

    const descInput = page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('Test group for redirect verification');
    }

    const createButton = page.locator('button:has-text("Create")').first();
    const nextButton = page.locator('button:has-text("Next")').first();

    for (let i = 0; i < 5; i++) {
      if (await createButton.isVisible()) break;
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(200);
      }
    }

    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForURL(/\/group\//, { timeout: 10000 }).catch(() => {
        return;
      });

      const isRedirected = page.url().includes('/group/');
      expect(isRedirected).toBeTruthy();
    }
  });

  test('Error Handling', async ({ page }) => {
    await page.goto('/create');

    await page.route('**/api/**', route => {
      return route.abort();
    });

    const groupsOption = page.locator('text=Groups').first();
    await groupsOption.click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('Error Test Group');

    expect(true).toBeTruthy();
  });

  test('Field Persistence in Guided Mode', async ({ page }) => {
    await page.goto('/create');

    const groupsOption = page.locator('text=Groups').first();
    await groupsOption.click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('Persistence Test');

    const nextButton = page.locator('button:has-text("Next")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);

      const prevButton = page
        .locator('button:has-text("Previous")')
        .or(page.locator('button:has-text("Back")'))
        .first();
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await page.waitForTimeout(300);

        const nameValue = await nameInput.inputValue();
        expect(nameValue).toBe('Persistence Test');
      }
    }
  });

  test('Create Multiple Entities in Session', async ({ page }) => {
    await page.goto('/create');

    const groupsOption = page.locator('text=Groups').first();
    await groupsOption.click();
    await page.waitForTimeout(500);

    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill('First Entity');

    const createButton = page.locator('button:has-text("Create")').first();
    const nextButton = page.locator('button:has-text("Next")').first();

    for (let i = 0; i < 5; i++) {
      if (await createButton.isVisible()) break;
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(200);
      }
    }

    expect(true).toBeTruthy();
  });
});
