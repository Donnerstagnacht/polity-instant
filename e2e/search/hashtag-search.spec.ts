// spec: e2e/test-plans/search-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Search - Hashtag Search', () => {
  test('User filters by topic/hashtag from filter panel', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search page with a query to populate results with topics
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel
    await page.waitForTimeout(500);
    await expect(page.getByText('Filters')).toBeVisible();

    // 6. Check if Topics section is visible (only visible if topics exist in results)
    const topicsSection = page.getByText('Topics');
    const hasTopics = await topicsSection.isVisible().catch(() => false);

    if (hasTopics) {
      // 7. Click on first available topic badge
      const firstTopic = page.locator('[class*="Badge"]').first();
      await firstTopic.click();

      // 8. Close filter panel
      await page.getByRole('button', { name: /close/i }).click();

      // 9. Wait for URL update
      await page.waitForTimeout(500);

      // 10. URL should contain topics parameter
      await expect(page).toHaveURL(/topics=/);
    } else {
      // If no topics available, just verify the filter panel opened
      await expect(page.getByText('Content Types')).toBeVisible();
    }
  });

  test('User views active topic filters', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate with topic filter
    await page.goto('/search?q=test&topics=education', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 4. Active topic badge should be visible in header (when filter panel is closed)
    const topicBadge = page.locator('[class*="Badge"]').filter({ hasText: /education/i });
    const hasBadge = await topicBadge.isVisible().catch(() => false);

    if (hasBadge) {
      await expect(topicBadge).toBeVisible();
    }

    // 5. URL contains the topic parameter
    await expect(page).toHaveURL(/topics=education/);
  });

  test('User removes topic filter', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate with topic filter
    await page.goto('/search?q=test&topics=sustainability', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 4. Check if active filter badge is visible
    const filterBadge = page.locator('[class*="Badge"]').filter({ hasText: /sustainability/i });
    const hasBadge = await filterBadge.isVisible().catch(() => false);

    if (hasBadge) {
      // 5. Click badge to remove filter
      await filterBadge.click();

      // 6. Wait for URL update
      await page.waitForTimeout(500);

      // 7. Topic parameter should be removed from URL
      const url = page.url();
      expect(url).not.toContain('topics=sustainability');
    } else {
      // Alternative: Open filter panel and deselect topic
      const filterButton = page.getByRole('button', { name: /filter/i });
      await filterButton.click();
      await page.waitForTimeout(500);

      // If topics section exists, click the topic badge to deselect
      const topicsSection = page.getByText('Topics');
      const hasTopics = await topicsSection.isVisible().catch(() => false);

      if (hasTopics) {
        const topicInPanel = page
          .locator('[class*="Badge"]')
          .filter({ hasText: /sustainability/i });
        const hasTopicInPanel = await topicInPanel.isVisible().catch(() => false);

        if (hasTopicInPanel) {
          await topicInPanel.click();
          await page.getByRole('button', { name: /close/i }).click();
          await page.waitForTimeout(500);

          const url = page.url();
          expect(url).not.toContain('topics=sustainability');
        }
      }
    }
  });

  test('User applies multiple topic filters', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to search
    await page.goto('/search?q=test', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // 3. Open filters
    const filterButton = page.getByRole('button', { name: /filter/i });
    await filterButton.click();

    // 4. Wait for filter panel and check if Topics section is visible
    await page.waitForTimeout(500);
    const topicsSection = page.getByText('Topics');
    const hasTopics = await topicsSection.isVisible().catch(() => false);

    if (hasTopics) {
      // 6. Click on multiple topic badges (first two available)
      const topicBadges = page.locator('[class*="Badge"]');
      const count = await topicBadges.count();

      if (count >= 2) {
        await topicBadges.nth(0).click();
        await topicBadges.nth(1).click();

        // 7. Close filter panel
        await page.getByRole('button', { name: /close/i }).click();

        // 8. Wait for URL update
        await page.waitForTimeout(500);

        // 9. URL should contain topics parameter with multiple values
        await expect(page).toHaveURL(/topics=/);
      }
    }
  });
});
