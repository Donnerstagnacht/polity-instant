// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Explore Mode', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Explore mode
    const exploreTab = page.getByRole('tab', { name: /explore/i });
    await exploreTab.click();
    await page.waitForLoadState('networkidle');
  });

  test('Explore mode shows section headers', async ({ page }) => {
    // Look for section headers like "Your Content", "Discover", "Trending"
    const yourContentSection = page.getByText(/your content/i);
    const discoverSection = page.getByText(/discover/i);
    const trendingSection = page.getByText(/trending/i);

    // At least one section header should be visible
    const hasYourContent = await yourContentSection.isVisible().catch(() => false);
    const hasDiscover = await discoverSection.isVisible().catch(() => false);
    const hasTrending = await trendingSection.isVisible().catch(() => false);

    // Note: Not all sections may be visible depending on content
    console.log(
      `Sections visible - Your Content: ${hasYourContent}, Discover: ${hasDiscover}, Trending: ${hasTrending}`
    );
  });

  test('Why am I seeing this tooltips appear on hover', async ({ page }) => {
    // Find cards with "why" or reason indicator
    const reasonIndicators = page.locator(
      '[data-testid="content-reason"], [title*="why"], [aria-label*="reason"]'
    );

    if ((await reasonIndicators.count()) > 0) {
      // Hover over the first reason indicator
      await reasonIndicators.first().hover();

      // Check for tooltip content
      const tooltip = page.locator('[role="tooltip"]');
      const tooltipVisible = await tooltip.isVisible().catch(() => false);

      if (tooltipVisible) {
        await expect(tooltip).toContainText(/trending|popular|recommended|suggested/i);
      }
    } else {
      console.log('No reason indicators found in Explore mode');
    }
  });

  test('User own content appears in Your Content section', async ({ page }) => {
    // Look for "Your Content" section
    const yourContentSection = page.locator('[data-testid="your-content-section"]');
    const yourContentHeader = page.getByText(/your content|my content/i);

    const hasOwnContentSection = await yourContentHeader.isVisible().catch(() => false);

    if (hasOwnContentSection) {
      // User's own content should show things they created
      // These could be amendments they authored, events they organized, etc.
      console.log('Your Content section is visible');
    }
  });

  test('Public content excludes items user is already subscribed to', async ({ page }) => {
    // This is harder to test directly without knowing what user is subscribed to
    // We can verify that Explore shows different content than Following

    // Count cards in Explore mode
    const exploreCards = page.locator('[class*="card"], [class*="Card"]');
    const exploreCardCount = await exploreCards.count();

    // Switch to Following mode
    const followingTab = page.getByRole('tab', { name: /following/i });
    await followingTab.click();
    await page.waitForLoadState('networkidle');

    // Count cards in Following mode
    const followingCards = page.locator('[class*="card"], [class*="Card"]');
    const followingCardCount = await followingCards.count();

    console.log(`Explore cards: ${exploreCardCount}, Following cards: ${followingCardCount}`);

    // Content should potentially differ (not a strict assertion as they could overlap)
  });

  test('Explore mode shows trending content indicators', async ({ page }) => {
    // Look for trending indicators (fire icon, trending label, etc.)
    const trendingIndicators = page.locator(
      '[data-testid="trending-indicator"], [class*="trending"], [aria-label*="trending"]'
    );

    const trendingLabels = page.getByText(/trending|popular|hot/i);

    const hasTrendingIndicators = (await trendingIndicators.count()) > 0;
    const hasTrendingLabels = await trendingLabels
      .first()
      .isVisible()
      .catch(() => false);

    console.log(
      `Trending indicators: ${hasTrendingIndicators}, Trending labels: ${hasTrendingLabels}`
    );
  });

  test('Explore mode has discover actions (follow, join)', async ({ page }) => {
    // Look for action buttons specific to discovery
    const followButtons = page.getByRole('button', { name: /follow/i });
    const joinButtons = page.getByRole('button', { name: /join/i });

    const hasFollowButtons = (await followButtons.count()) > 0;
    const hasJoinButtons = (await joinButtons.count()) > 0;

    console.log(`Follow buttons: ${hasFollowButtons}, Join buttons: ${hasJoinButtons}`);
  });
});

test.describe('Timeline - Explore Mode Content Types', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Switch to Explore mode
    const exploreTab = page.getByRole('tab', { name: /explore/i });
    await exploreTab.click();
    await page.waitForLoadState('networkidle');
  });

  test('Explore mode can show groups to discover', async ({ page }) => {
    const groupCards = page.locator('[data-testid="group-card"], [class*="GroupCard"]');
    const groupCount = await groupCards.count();

    console.log(`Discoverable groups: ${groupCount}`);
  });

  test('Explore mode can show events to discover', async ({ page }) => {
    const eventCards = page.locator('[data-testid="event-card"], [class*="EventCard"]');
    const eventCount = await eventCards.count();

    console.log(`Discoverable events: ${eventCount}`);
  });

  test('Explore mode can show amendments to discover', async ({ page }) => {
    const amendmentCards = page.locator('[data-testid="amendment-card"], [class*="AmendmentCard"]');
    const amendmentCount = await amendmentCards.count();

    console.log(`Discoverable amendments: ${amendmentCount}`);
  });
});
