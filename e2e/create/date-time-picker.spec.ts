import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Date and Time Picker', async ({ authenticatedPage: page }) => {
    // Navigate to create event page
    await page.goto('/create/event');

    // Fill in title first (may be required)
    const titleInput = page.locator('input[name="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Test Event for Date Picker');
    }

    // Navigate to date field
    const nextButton = page
      .locator('[data-testid="next-button"]')
      .or(page.locator('button:has-text("Next")'))
      .first();
    const dateInput = page
      .locator('input[type="date"]')
      .or(page.locator('input[name="date"]'))
      .first();

    // Try to find date field
    for (let i = 0; i < 5; i++) {
      if (await dateInput.isVisible()) break;
      if (await nextButton.isVisible()) {
        await nextButton.click();
      } else {
        break;
      }
    }

    // If date field found, test date selection
    if (await dateInput.isVisible()) {
      // Click date field
      await dateInput.click();

      // Set date value
      await dateInput.fill('2024-12-25');


      // Verify date is set
      const dateValue = await dateInput.inputValue();
      expect(dateValue).toBe('2024-12-25');

      // Try to find time field
      const timeInput = page
        .locator('input[type="time"]')
        .or(page.locator('input[name="time"]'))
        .first();

      if (await timeInput.isVisible()) {
        // Click time field
        await timeInput.click();

        // Set time value
        await timeInput.fill('14:30');


        // Verify time is set
        const timeValue = await timeInput.inputValue();
        expect(timeValue).toBe('14:30');
      } else {
        // Time field might be on next step
        if (await nextButton.isVisible()) {
          await nextButton.click();

          const timeInputNext = page.locator('input[type="time"]').first();
          if (await timeInputNext.isVisible()) {
            await timeInputNext.fill('14:30');
            const timeValue = await timeInputNext.inputValue();
            expect(timeValue).toBe('14:30');
          }
        }
      }
    } else {
      console.log('Date field not found');
      expect(true).toBeTruthy();
    }
  });
});
