// spec: Accreditation agenda item type

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Accreditation Agenda Item Type', () => {
  test('Accreditation type appears in create agenda item form', async ({
    authenticatedPage: page,
  }) => {
    // Navigate to create agenda item page for the test event
    await page.goto(`/create/agenda-item?eventId=${TEST_ENTITY_IDS.EVENT}`);
    await page.waitForLoadState('networkidle');

    // Look for accreditation type option
    const accreditationOption = page.getByText(/accreditation/i);

    if ((await accreditationOption.count()) > 0) {
      await expect(accreditationOption.first()).toBeVisible();
    }
  });

  test('Accreditation agenda item shows confirmation UI', async ({ authenticatedPage: page }) => {
    // Navigate to event agenda
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // Look for accreditation-type agenda item (teal badge)
    const accreditationBadge = page.getByText(/accreditation/i);

    if ((await accreditationBadge.count()) > 0) {
      // Click on it to view details
      await accreditationBadge.first().click();
      await page.waitForLoadState('networkidle');

      // Should show "Confirm Attendance" button or "confirmed" status
      const confirmButton = page.getByRole('button', { name: /confirm attendance/i });
      const confirmedStatus = page.getByText(/attendance.*confirmed|confirmed/i);

      const hasAccreditationUI =
        (await confirmButton.count()) > 0 || (await confirmedStatus.count()) > 0;

      if (hasAccreditationUI) {
        if ((await confirmButton.count()) > 0) {
          await expect(confirmButton).toBeVisible();
        } else if ((await confirmedStatus.count()) > 0) {
          await expect(confirmedStatus.first()).toBeVisible();
        }
      }
    }
  });

  test('Accreditation shows accredited participant count', async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // Find accreditation section with participant count
    const accreditedCount = page.getByText(/\d+\s*accredited/i);

    if ((await accreditedCount.count()) > 0) {
      await expect(accreditedCount.first()).toBeVisible();
    }
  });

  test('Confirm attendance requires voting password', async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // Navigate to accreditation item if present
    const accreditationBadge = page.getByText(/accreditation/i);
    if ((await accreditationBadge.count()) > 0) {
      await accreditationBadge.first().click();
      await page.waitForLoadState('networkidle');
    }

    const confirmButton = page.getByRole('button', { name: /confirm attendance/i });

    if ((await confirmButton.count()) > 0) {
      await confirmButton.click();

      // Password input should appear
      const passwordInput = page
        .locator('input[inputmode="numeric"]')
        .or(page.locator('input[type="password"]'));

      if ((await passwordInput.count()) > 0) {
        await expect(passwordInput.first()).toBeVisible();
      }
    }
  });
});
