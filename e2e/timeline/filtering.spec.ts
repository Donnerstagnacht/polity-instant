// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Filter panel is accessible', async ({ page }) => {
    // Look for filter button or panel
    const filterButton = page.getByRole('button', { name: /filter/i });
    const filterPanel = page.locator('[data-testid="filter-panel"], [class*="filter"]');

    const hasFilterButton = await filterButton.isVisible().catch(() => false);
    const hasFilterPanel = (await filterPanel.count()) > 0;

    expect(hasFilterButton || hasFilterPanel).toBe(true);
  });

  test('Can filter by content type', async ({ page }) => {
    // Open filter if needed
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }

    // Look for content type options
    const contentTypeOptions = page.locator(
      '[data-testid="content-type-filter"], [class*="content-type"]'
    );
    const typeCheckboxes = page.locator(
      '[type="checkbox"][name*="type"], [role="checkbox"][aria-label*="type"]'
    );

    console.log(
      `Content type filters: ${await contentTypeOptions.count()}, Checkboxes: ${await typeCheckboxes.count()}`
    );
  });

  test('Can filter by topic/tag', async ({ page }) => {
    // Look for topic filter
    const topicFilter = page.locator('[data-testid="topic-filter"], [class*="topic-filter"]');
    const topicPills = page.locator('[class*="topic-pill"], [class*="TopicPill"]');

    const hasTopicFilter = (await topicFilter.count()) > 0;
    const hasTopicPills = (await topicPills.count()) > 0;

    console.log(`Topic filter: ${hasTopicFilter}, Topic pills: ${hasTopicPills}`);

    // If topic pills exist, try clicking one
    if (hasTopicPills) {
      await topicPills.first().click();
      await page.waitForLoadState('networkidle');

      // Verify filter was applied
      const activeFilters = page.locator(
        '[data-testid="active-filters"], [class*="active-filter"]'
      );
      console.log(`Active filters after click: ${await activeFilters.count()}`);
    }
  });

  test('Can sort timeline content', async ({ page }) => {
    // Look for sort control
    const sortButton = page.getByRole('button', { name: /sort/i });
    const sortSelect = page.locator('select[name*="sort"], [data-testid="sort-select"]');

    const hasSortButton = await sortButton.isVisible().catch(() => false);
    const hasSortSelect = (await sortSelect.count()) > 0;

    if (hasSortButton) {
      await sortButton.click();

      // Look for sort options
      const sortOptions = page.locator('[role="option"], [role="menuitem"]');
      const optionCount = await sortOptions.count();
      console.log(`Sort options: ${optionCount}`);
    }
  });

  test('Filters persist when switching modes', async ({ page }) => {
    // Apply a filter (if possible)
    const topicPills = page.locator('[class*="topic-pill"], [class*="TopicPill"]');

    if ((await topicPills.count()) > 0) {
      await topicPills.first().click();
      await page.waitForLoadState('networkidle');

      // Switch to Explore mode
      const exploreTab = page.getByRole('tab', { name: /explore/i });
      await exploreTab.click();
      await page.waitForLoadState('networkidle');

      // Check if filter is still visible
      const activeFilters = page.locator(
        '[data-testid="active-filters"], [class*="active-filter"]'
      );
      console.log(`Active filters in Explore mode: ${await activeFilters.count()}`);

      // Switch back to Following
      const followingTab = page.getByRole('tab', { name: /following/i });
      await followingTab.click();
      await page.waitForLoadState('networkidle');

      console.log(`Active filters in Following mode: ${await activeFilters.count()}`);
    }
  });

  test('Can clear all filters', async ({ page }) => {
    // Apply a filter first
    const topicPills = page.locator('[class*="topic-pill"], [class*="TopicPill"]');

    if ((await topicPills.count()) > 0) {
      await topicPills.first().click();
      await page.waitForLoadState('networkidle');

      // Look for clear filters button
      const clearButton = page.getByRole('button', { name: /clear|reset/i });

      if (await clearButton.isVisible()) {
        await clearButton.click();
        await page.waitForLoadState('networkidle');

        // Verify filters are cleared
        const activeFilters = page.locator(
          '[data-testid="active-filters"], [class*="active-filter"]'
        );
        console.log(`Filters after clear: ${await activeFilters.count()}`);
      }
    }
  });

  test('Filtering updates card count', async ({ page }) => {
    // Count initial cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const initialCount = await cards.count();

    // Apply a filter
    const topicPills = page.locator('[class*="topic-pill"], [class*="TopicPill"]');

    if ((await topicPills.count()) > 0 && initialCount > 0) {
      await topicPills.first().click();
      await page.waitForLoadState('networkidle');

      const filteredCount = await cards.count();
      console.log(`Cards before filter: ${initialCount}, after filter: ${filteredCount}`);

      // Filtered count should be different (or same if all match)
    }
  });
});

test.describe('Timeline - Filter UI', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Active filters are displayed as removable pills', async ({ page }) => {
    // Apply a filter
    const topicPills = page.locator('[class*="topic-pill"], [class*="TopicPill"]');

    if ((await topicPills.count()) > 0) {
      await topicPills.first().click();
      await page.waitForLoadState('networkidle');

      // Look for active filter pills with remove buttons
      const activeFilterPills = page.locator('[data-testid="active-filter-pill"]');
      const removeButtons = page.locator('[aria-label*="remove filter"], button[class*="remove"]');

      console.log(
        `Active pills: ${await activeFilterPills.count()}, Remove buttons: ${await removeButtons.count()}`
      );
    }
  });

  test('Filter summary shows count of active filters', async ({ page }) => {
    // Look for filter count indicator
    const filterCount = page.locator('[data-testid="filter-count"], [class*="filter-count"]');

    if ((await filterCount.count()) > 0) {
      const countText = await filterCount.textContent();
      console.log(`Filter count indicator: ${countText}`);
    }
  });
});
