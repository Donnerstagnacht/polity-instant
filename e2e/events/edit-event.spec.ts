import { test, expect } from '../fixtures/test-base';
import { gotoWithRetry } from '../helpers/navigation';

test.describe('Event - Edit Event', () => {
  test('should display event edit form with fields', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const titleInput = page.locator('#title');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    const descriptionInput = page.locator('#description');
    await expect(descriptionInput).toBeVisible();
  });

  test('should display date/time inputs', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const startDate = page.locator('#startDate');
    await expect(startDate).toBeVisible({ timeout: 10000 });
  });

  test('should display location and capacity fields', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const locationInput = page.locator('#location');
    await expect(locationInput).toBeVisible({ timeout: 10000 });

    const capacityInput = page.locator('#capacity');
    await expect(capacityInput).toBeVisible();
  });

  test('should display public/private switch', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const publicSwitch = page.getByRole('switch');
    await expect(publicSwitch.first()).toBeVisible({ timeout: 10000 });
  });

  test('should save changes to event', async ({
    authenticatedPage: page,
    mainUserId,
    eventFactory,
  }) => {
    const event = await eventFactory.createEvent(mainUserId);
    await gotoWithRetry(page, `/event/${event.id}/edit`);

    const titleInput = page.locator('#title');
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    await titleInput.clear();
    await titleInput.fill('Updated E2E Event');

    const saveButton = page.getByRole('button', { name: /save changes/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
    await page.waitForLoadState('networkidle');
  });
});
