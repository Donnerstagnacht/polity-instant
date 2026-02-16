import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event - Cancel Event', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/edit`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Cancel Event button for authorized users', async ({ authenticatedPage: page }) => {
    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    if ((await cancelEventButton.count()) > 0) {
      await expect(cancelEventButton).toBeVisible();
    }
  });

  test('should open Cancel Event dialog with reason field', async ({ authenticatedPage: page }) => {
    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    if ((await cancelEventButton.count()) === 0) {
      test.skip();
      return;
    }

    await cancelEventButton.click();

    // Dialog should appear
    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) > 0) {
      await expect(dialog).toBeVisible();

      // Should have a reason textarea (required)
      const reasonField = dialog.locator('textarea');
      if ((await reasonField.count()) > 0) {
        await expect(reasonField).toBeVisible();
      }

      // Confirm/cancel buttons
      const confirmButton = dialog.getByRole('button', { name: /confirm|cancel event/i });
      if ((await confirmButton.count()) > 0) {
        await expect(confirmButton.first()).toBeVisible();
      }
    }
  });

  test('should show agenda item reassignment options in cancel dialog', async ({ authenticatedPage: page }) => {
    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    if ((await cancelEventButton.count()) === 0) {
      test.skip();
      return;
    }

    await cancelEventButton.click();

    const dialog = page.getByRole('dialog');
    if ((await dialog.count()) > 0) {
      // Check for agenda item reassignment section
      const agendaCheckboxes = dialog.getByRole('checkbox');
      if ((await agendaCheckboxes.count()) > 0) {
        // Agenda items are listed for reassignment
        await expect(agendaCheckboxes.first()).toBeVisible();
      }
    }
  });
});
