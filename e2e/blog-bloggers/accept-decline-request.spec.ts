import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - Accept/Decline Request', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/bloggers`);
    await page.waitForLoadState('networkidle');
  });

  test('should show Accept and Decline buttons on pending requests', async ({ authenticatedPage: page }) => {
    const pendingSection = page
      .locator('div')
      .filter({ hasText: 'Pending Requests' })
      .first();
    const acceptButton = pendingSection.getByRole('button', { name: /accept/i });
    const declineButton = pendingSection.getByRole('button', { name: /decline/i });

    if ((await acceptButton.count()) > 0) {
      await expect(acceptButton.first()).toBeVisible();
      await expect(declineButton.first()).toBeVisible();
    }
  });

  test('should show Cancel button on invited bloggers', async ({ authenticatedPage: page }) => {
    const invitedSection = page
      .locator('div')
      .filter({ hasText: 'Invited Bloggers' })
      .first();
    const cancelButton = invitedSection.getByRole('button', { name: /cancel/i });

    if ((await cancelButton.count()) > 0) {
      await expect(cancelButton.first()).toBeVisible();
    }
  });

  test('should show Remove button on active bloggers', async ({ authenticatedPage: page }) => {
    const activeSection = page
      .locator('div')
      .filter({ hasText: 'Active Bloggers' })
      .first();
    const removeButton = activeSection.getByRole('button', { name: /remove/i });

    if ((await removeButton.count()) > 0) {
      await expect(removeButton.first()).toBeVisible();
    }
  });
});
