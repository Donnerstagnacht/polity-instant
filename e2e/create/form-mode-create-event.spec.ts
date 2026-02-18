import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Form Mode - Create Event', async ({ authenticatedPage: page }) => {
    await page.goto('/create/event');

    // Step 0: Title + Description
    await page.locator('#event-title').fill('Startup Pitch Night');
    await page.locator('#event-description').fill('An evening of startup pitches and networking');

    const nextButton = page.getByRole('button', { name: 'Next', exact: true });

    // Step 0→1 (Date & Time)
    await nextButton.click();

    // Fill start date
    const startDate = page.locator('#event-start-date');
    if (await startDate.isVisible()) {
      await startDate.fill('2025-12-20');
    }

    // Navigate through remaining steps: 1→2→3→4→5→6→7 (6 clicks)
    for (let i = 0; i < 6; i++) {
      await nextButton.click();
    }

    // Click Create Event
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
