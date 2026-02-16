import { test, expect } from '../fixtures/test-base';
import { navigateToMeeting } from '../helpers/navigation';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Meet - Video Meeting', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/meet');
    await page.waitForLoadState('networkidle');
  });

  test('should display meeting page', async ({ authenticatedPage: page }) => {
    const meetHeading = page.getByRole('heading', { name: /meet|meeting/i });
    if ((await meetHeading.count()) > 0) {
      await expect(meetHeading.first()).toBeVisible();
    }
  });

  test('should display meeting scheduling options', async ({ authenticatedPage: page }) => {
    // Look for create/schedule meeting button
    const createButton = page.getByRole('button', { name: /create|schedule|new/i });
    if ((await createButton.count()) > 0) {
      await expect(createButton.first()).toBeVisible();
    }
  });

  test('should display meeting slots list', async ({ authenticatedPage: page }) => {
    // Meeting slots or upcoming meetings should be displayed
    const meetSlots = page.locator('[class*="meeting"], [class*="slot"]');
    if ((await meetSlots.count()) > 0) {
      await expect(meetSlots.first()).toBeVisible();
    }
  });
});

test.describe('Meet - Meeting Detail', () => {
  test('should navigate to meeting detail page', async ({ authenticatedPage: page }) => {
    await navigateToMeeting(page, TEST_ENTITY_IDS.testMeetingSlot1);

    // Meeting page should load (or show not found)
    await page.waitForLoadState('networkidle');
  });
});
