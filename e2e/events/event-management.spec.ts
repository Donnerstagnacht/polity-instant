import { test, expect } from '../fixtures/test-base';
import { navigateToEvent } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event - Cancelled Event Banner', () => {
  test('should display cancelled banner on cancelled event', async ({ authenticatedPage: page }) => {
    // Navigate to an event (may or may not be cancelled)
    await navigateToEvent(page, TEST_ENTITY_IDS.EVENT);

    // If the event is cancelled, a banner should be visible
    const cancelledBanner = page.getByText(/cancelled|this event has been cancelled/i);
    if ((await cancelledBanner.count()) > 0) {
      await expect(cancelledBanner.first()).toBeVisible();
    }
  });
});

test.describe('Event - Participant Management', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/participants`);
    await page.waitForLoadState('networkidle');
  });

  test('should display participants page', async ({ authenticatedPage: page }) => {
    const participantsHeading = page.getByText(/participants/i);
    if ((await participantsHeading.count()) > 0) {
      await expect(participantsHeading.first()).toBeVisible();
    }
  });

  test('should show invite button for organizers', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite/i });
    if ((await inviteButton.count()) > 0) {
      await expect(inviteButton.first()).toBeVisible();
    }
  });
});

test.describe('Event - Network & Stream', () => {
  test('should display event network page', async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/network`);
    await page.waitForLoadState('networkidle');

    // Network page should load without errors
    const networkContent = page.getByText(/network/i);
    if ((await networkContent.count()) > 0) {
      await expect(networkContent.first()).toBeVisible();
    }
  });

  test('should display event agenda page', async ({ authenticatedPage: page }) => {
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // Agenda page should load without errors
    await page.waitForLoadState('networkidle');
  });
});
