import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Guided Mode - Create Event', async ({ authenticatedPage: page }) => {
    await page.goto('/create/event');

    // Step 0: Title + Description
    await page.locator('#event-title').fill('Community Meetup 2024');
    await page.locator('#event-description').fill('Monthly community gathering for tech enthusiasts');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Step 0→1 (Date & Time)
    await nextButton.click();

    // Step 1: Set start date and time
    const startDate = page.locator('#event-start-date');
    if (await startDate.isVisible()) {
      await startDate.fill('2025-12-15');
    }
    const startTime = page.locator('#event-start-time');
    if (await startTime.isVisible()) {
      await startTime.fill('18:00');
    }

    // Navigate through remaining steps: 1→2→3→4→5→6→7 (6 more clicks)
    for (let i = 0; i < 6; i++) {
      await nextButton.click();
    }

    // Step 7: Review - Click Create Event
    const createButton = page.getByRole('button', { name: /create.*event/i });
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Wait for redirect
    await page.waitForURL(/\/event\//, { timeout: 10000 }).catch(() => {});

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
