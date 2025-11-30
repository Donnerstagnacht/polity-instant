import { test, expect } from '@playwright/test';

test.describe('Create Feature', () => {
  test('Form Mode - Create Event', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');

    // Switch to form mode
    const modeToggle = page
      .locator('[data-testid="mode-toggle"]')
      .or(page.getByRole('switch'))
      .first();
    await modeToggle.click();

    await page.waitForTimeout(500);

    // Click Events tab
    const eventsTab = page
      .locator('[role="tab"]:has-text("Events")')
      .or(page.locator('button:has-text("Events")').first());
    if (await eventsTab.isVisible()) {
      await eventsTab.click();
    }

    // Fill all event fields simultaneously
    const titleInput = page.locator('input[name="title"]').or(page.getByLabel(/title/i)).first();
    await titleInput.fill('Startup Pitch Night');

    const descriptionInput = page
      .locator('textarea[name="description"]')
      .or(page.getByLabel(/description/i))
      .first();
    await descriptionInput.fill('An evening of startup pitches and networking');

    // Set date
    const dateInput = page
      .locator('input[type="date"]')
      .or(page.locator('input[name="date"]'))
      .first();
    if (await dateInput.isVisible()) {
      await dateInput.fill('2024-12-20');
    }

    // Set time
    const timeInput = page
      .locator('input[type="time"]')
      .or(page.locator('input[name="time"]'))
      .first();
    if (await timeInput.isVisible()) {
      await timeInput.fill('19:00');
    }

    // Set location
    const locationInput = page
      .locator('input[name="location"]')
      .or(page.getByLabel(/location/i))
      .first();
    if (await locationInput.isVisible()) {
      await locationInput.fill('Innovation Center, Alexanderplatz');
    }

    // Click Create Event button
    const createButton = page
      .locator('button:has-text("Create Event")')
      .or(page.locator('button:has-text("Create")'))
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
