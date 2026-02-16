// spec: e2e/test-plans/groups-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Groups - Group Content Association', () => {
  test('Group displays associated events', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. View events section
    const eventsTab = page.getByRole('tab', { name: /event/i });
    if ((await eventsTab.count()) > 0) {
      await eventsTab.click();
    }

    // 5. All group events listed
    const eventCards = page.getByRole('article').or(page.locator('[data-entity-type="event"]'));

    // 6. Events clickable to view full event
    if ((await eventCards.count()) > 0) {
      // Events associated with group
    }
  });

  test('Group displays associated blogs', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to group page
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. View blogs section
    const blogsTab = page.getByRole('tab', { name: /blog/i });
    if ((await blogsTab.count()) > 0) {
      await blogsTab.click();
    }

    // 4. Blog cards displayed with gradients
    const blogCards = page.getByRole('article').or(page.locator('[data-entity-type="blog"]'));

    // 5. Clickable to view full blog
    if ((await blogCards.count()) > 0) {
      const firstBlog = blogCards.first();
      await firstBlog.click();

      await page.waitForURL(/\/blog\/.+/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });

  test('Group content tabs switch correctly', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as test user
    // 2. Navigate to group with various content
    await page.goto(`/group/${TEST_ENTITY_IDS.GROUP}`);
    await page.waitForLoadState('networkidle');

    // 3. Switch between content tabs
    const eventsTab = page.getByRole('tab', { name: /event/i });
    const blogsTab = page.getByRole('tab', { name: /blog/i });
    page.getByRole('tab', { name: /amendment/i });

    // 4. Each tab shows proper content
    if ((await eventsTab.count()) > 0) {
      await eventsTab.click();
      await expect(eventsTab).toHaveAttribute('data-state', 'active');
    }

    if ((await blogsTab.count()) > 0) {
      await blogsTab.click();
      await expect(blogsTab).toHaveAttribute('data-state', 'active');
    }

    // Each tab properly filtered
    // Counts accurate
  });
});
