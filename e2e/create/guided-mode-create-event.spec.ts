import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Guided Mode - Create Event', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Select Events entity type
    const eventsOption = page
      .locator('text=Events')
      .or(page.locator('[data-entity="events"]'))
      .first();
    await eventsOption.click();

    await page.waitForTimeout(500);

    // Enter event title
    const titleInput = page
      .locator('input[name="title"]')
      .or(page.getByPlaceholder(/title/i))
      .first();
    await titleInput.fill('Community Meetup 2024');

    // Advance carousel
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Enter event description
    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByPlaceholder(/description/i))
      .first();
    await descriptionInput.fill('Monthly community gathering for tech enthusiasts');

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Select event date
    const dateInput = page
      .locator('input[type="date"]')
      .or(page.locator('input[name="date"]'))
      .first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2024-12-15');
    }

    // Select event time
    const timeInput = page
      .locator('input[type="time"]')
      .or(page.locator('input[name="time"]'))
      .first();
    if (await timeInput.isVisible()) {
      await timeInput.fill('18:00');
    }

    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    // Set location
    const locationInput = page
      .locator('input[name="location"]')
      .or(page.getByPlaceholder(/location/i))
      .first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('Berlin Tech Hub');
    }

    // Click Create Event button
    const createButton = page
      .locator('button:has-text("Create")')
      .or(page.locator('[data-testid="create-button"]'))
      .first();
    await createButton.click();

    // Wait for navigation or success
    await page.waitForURL(/\/event\//, { timeout: 5000 }).catch(() => {
      return;
    });

    // Verify success
    const isRedirected = page.url().includes('/event/');
    const successMessage = await page
      .locator('text=created')
      .or(page.locator('[role="alert"]'))
      .first()
      .isVisible()
      .catch(() => false);

    expect(isRedirected || successMessage).toBeTruthy();
  });
});
