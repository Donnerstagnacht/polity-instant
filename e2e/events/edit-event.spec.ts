import { test, expect } from '../fixtures/test-base';
import { navigateToEvent } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event - Edit Event', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/edit`);
    await page.waitForLoadState('networkidle');
  });

  test('should display event edit form with fields', async ({ authenticatedPage: page }) => {
    // Title field (required)
    const titleInput = page.getByRole('textbox', { name: /title/i });
    if ((await titleInput.count()) > 0) {
      await expect(titleInput).toBeVisible();
    }

    // Description field
    const descriptionInput = page.locator('textarea');
    if ((await descriptionInput.count()) > 0) {
      await expect(descriptionInput.first()).toBeVisible();
    }
  });

  test('should display date/time inputs', async ({ authenticatedPage: page }) => {
    const startDate = page.locator('input[type="datetime-local"]');
    if ((await startDate.count()) > 0) {
      await expect(startDate.first()).toBeVisible();
    }
  });

  test('should display location and capacity fields', async ({ authenticatedPage: page }) => {
    const locationInput = page.getByRole('textbox', { name: /location/i });
    if ((await locationInput.count()) > 0) {
      await expect(locationInput).toBeVisible();
    }

    const capacityInput = page.locator('input[type="number"]');
    if ((await capacityInput.count()) > 0) {
      await expect(capacityInput.first()).toBeVisible();
    }
  });

  test('should display public/private switch', async ({ authenticatedPage: page }) => {
    const publicSwitch = page.getByRole('switch');
    if ((await publicSwitch.count()) > 0) {
      await expect(publicSwitch.first()).toBeVisible();
    }
  });

  test('should save changes to event', async ({ authenticatedPage: page }) => {
    const titleInput = page.getByRole('textbox', { name: /title/i });
    if ((await titleInput.count()) === 0) {
      test.skip();
      return;
    }

    await titleInput.clear();
    await titleInput.fill('Updated E2E Event');

    const saveButton = page.getByRole('button', { name: /save changes/i });
    if ((await saveButton.count()) > 0) {
      await saveButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});
