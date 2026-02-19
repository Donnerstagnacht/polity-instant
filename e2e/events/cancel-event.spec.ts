import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event - Cancel Event', () => {
  test('should display Cancel Event button for authorized users', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    await expect(cancelEventButton).toBeVisible({ timeout: 10000 });
  });

  test('should open Cancel Event dialog with reason field', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    await expect(cancelEventButton).toBeVisible({ timeout: 10000 });
    await cancelEventButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should have a reason textarea
    const reasonField = dialog.locator('#reason');
    await expect(reasonField).toBeVisible();

    // Confirm button
    const confirmButton = dialog.getByRole('button', { name: /cancel event/i });
    await expect(confirmButton.first()).toBeVisible();
  });

  test('should show agenda item reassignment options in cancel dialog', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    // Create an agenda item so the reassignment section appears
    await eventFactory.createAgendaItem(event.id, mainUserId, {
      title: 'E2E Agenda Item for Cancel',
    });

    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const cancelEventButton = page.getByRole('button', { name: /cancel event/i });
    await expect(cancelEventButton).toBeVisible({ timeout: 10000 });
    await cancelEventButton.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Check for agenda item checkboxes
    const agendaCheckboxes = dialog.getByRole('checkbox');
    await expect(agendaCheckboxes.first()).toBeVisible({ timeout: 5000 });
  });
});
