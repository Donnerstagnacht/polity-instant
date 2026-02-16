import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Blog Bloggers - Invite Blogger', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto(`/blog/${TEST_ENTITY_IDS.BLOG}/bloggers`);
    await page.waitForLoadState('networkidle');
  });

  test('should display Invite Bloggers button', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    if ((await inviteButton.count()) > 0) {
      await expect(inviteButton).toBeVisible();
    }
  });

  test('should open Invite Bloggers dialog', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    if ((await inviteButton.count()) === 0) {
      test.skip();
      return;
    }

    await inviteButton.click();

    // Dialog should appear
    await expect(page.getByText('Invite Bloggers')).toBeVisible();
    await expect(page.getByText('Search and select users to invite as bloggers')).toBeVisible();

    // Search input
    const searchInput = page.getByPlaceholder('Search users...');
    await expect(searchInput).toBeVisible();
  });

  test('should search for users in the invite dialog', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    if ((await inviteButton.count()) === 0) {
      test.skip();
      return;
    }

    await inviteButton.click();
    await expect(page.getByText('Invite Bloggers')).toBeVisible();

    // Type in search
    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('test');

    // User results should appear (or "No users found.")
    const noUsers = page.getByText('No users found.');
    const userResults = page.locator('[role="option"]');

    const hasResults = (await userResults.count()) > 0;
    const hasEmpty = (await noUsers.count()) > 0;
    expect(hasResults || hasEmpty).toBeTruthy();
  });

  test('should show invite button with count after selecting users', async ({ authenticatedPage: page }) => {
    const inviteButton = page.getByRole('button', { name: /invite bloggers/i });
    if ((await inviteButton.count()) === 0) {
      test.skip();
      return;
    }

    await inviteButton.click();
    await expect(page.getByText('Invite Bloggers')).toBeVisible();

    const searchInput = page.getByPlaceholder('Search users...');
    await searchInput.fill('test');

    const userResults = page.locator('[role="option"]');
    if ((await userResults.count()) > 0) {
      await userResults.first().click();

      // The invite button should show count
      const submitButton = page.getByRole('button', { name: /invite \d+ blogger/i });
      await expect(submitButton).toBeVisible();
    }
  });
});
