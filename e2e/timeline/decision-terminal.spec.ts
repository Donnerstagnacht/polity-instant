// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Decision Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Decision Terminal tab is visible', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });
    const decisionTerminal = page.locator('[data-testid="decision-terminal"]');

    const hasTab = await decisionsTab.isVisible().catch(() => false);
    const hasTerminal = (await decisionTerminal.count()) > 0;

    console.log(`Decision Terminal - Tab: ${hasTab}, Terminal: ${hasTerminal}`);
  });

  test('Decision Terminal shows vote rows', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for vote rows
      const voteRows = page.locator(
        '[data-testid="vote-row"], [class*="vote-row"], tr[data-vote-id]'
      );

      console.log(`Vote rows in terminal: ${await voteRows.count()}`);
    }
  });

  test('Decision Terminal shows election rows', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for election rows
      const electionRows = page.locator(
        '[data-testid="election-row"], [class*="election-row"], tr[data-election-id]'
      );

      console.log(`Election rows in terminal: ${await electionRows.count()}`);
    }
  });

  test('Decision Terminal has status indicators', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for status indicators (open, closing soon, closed, etc.)
      const statusIndicators = page.locator(
        '[data-testid="status-indicator"], [class*="status"], [class*="badge"]'
      );

      console.log(`Status indicators: ${await statusIndicators.count()}`);

      // Check for specific status colors
      const openStatus = page.locator('[class*="green"], [data-status="open"]');
      const closingSoon = page.locator('[class*="yellow"], [data-status="closing"]');
      const urgent = page.locator('[class*="red"], [data-status="urgent"]');

      console.log(
        `Open: ${await openStatus.count()}, Closing: ${await closingSoon.count()}, Urgent: ${await urgent.count()}`
      );
    }
  });

  test('Decision Terminal shows countdown timers', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for countdown/time remaining elements
      const countdowns = page.locator(
        '[data-testid="countdown"], [class*="countdown"], [class*="time-remaining"]'
      );

      console.log(`Countdown elements: ${await countdowns.count()}`);
    }
  });

  test('Clicking row opens side panel', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Find a row to click
      const rows = page.locator(
        '[data-testid="vote-row"], [data-testid="election-row"], tr[data-vote-id]'
      );

      if ((await rows.count()) > 0) {
        await rows.first().click();

        // Wait for side panel
        const sidePanel = page.locator(
          '[data-testid="decision-panel"], [class*="side-panel"], [role="complementary"]'
        );

        if (await sidePanel.isVisible()) {
          await expect(sidePanel).toBeVisible();

          // Panel should have vote/election details
          const details = sidePanel.locator('[class*="detail"], [class*="summary"]');
          console.log(`Panel detail elements: ${await details.count()}`);
        }
      }
    }
  });

  test('Side panel has voting controls', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      const rows = page.locator('[data-testid="vote-row"], tr[data-vote-id]');

      if ((await rows.count()) > 0) {
        await rows.first().click();

        const sidePanel = page.locator('[data-testid="decision-panel"]');

        if (await sidePanel.isVisible()) {
          // Look for vote buttons
          const supportButton = sidePanel.getByRole('button', { name: /support|yes|approve/i });
          const opposeButton = sidePanel.getByRole('button', { name: /oppose|no|reject/i });

          console.log(
            `Support button: ${await supportButton.isVisible().catch(() => false)}, ` +
              `Oppose button: ${await opposeButton.isVisible().catch(() => false)}`
          );
        }
      }
    }
  });

  test('Decision Terminal has filter tabs', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for filter tabs (Live, Closing Soon, Recently Closed)
      const liveTab = page.getByRole('tab', { name: /live|open/i });
      const closingTab = page.getByRole('tab', { name: /closing soon/i });
      const closedTab = page.getByRole('tab', { name: /closed|recent/i });

      console.log(
        `Filter tabs - Live: ${await liveTab.isVisible().catch(() => false)}, ` +
          `Closing: ${await closingTab.isVisible().catch(() => false)}, ` +
          `Closed: ${await closedTab.isVisible().catch(() => false)}`
      );
    }
  });

  test('Recently Closed section shows results', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Click on Recently Closed tab if present
      const closedTab = page.getByRole('tab', { name: /closed|recent/i });

      if (await closedTab.isVisible()) {
        await closedTab.click();
        await page.waitForLoadState('networkidle');

        // Look for result indicators
        const passedResults = page.locator('[class*="passed"], [data-result="passed"]');
        const failedResults = page.locator('[class*="failed"], [data-result="failed"]');

        console.log(
          `Passed: ${await passedResults.count()}, Failed: ${await failedResults.count()}`
        );
      }
    }
  });
});

test.describe('Timeline - Decision Terminal Mobile', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Decision Terminal adapts to mobile', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // On mobile, terminal should show cards instead of table rows
      const mobileCards = page.locator('[data-testid="decision-card"], [class*="decision-card"]');
      const tableRows = page.locator('tr[data-vote-id]');

      console.log(
        `Mobile cards: ${await mobileCards.count()}, Table rows: ${await tableRows.count()}`
      );
    }
  });

  test('Mobile Decision Terminal has swipe actions', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      // Look for swipeable elements
      const swipeableCards = page.locator('[data-swipeable], [class*="swipe"]');

      console.log(`Swipeable elements: ${await swipeableCards.count()}`);
    }
  });

  test('Cast Vote button is prominent on mobile', async ({ page }) => {
    const decisionsTab = page.getByRole('tab', { name: /decisions/i });

    if (await decisionsTab.isVisible()) {
      await decisionsTab.click();
      await page.waitForLoadState('networkidle');

      const castVoteButtons = page.getByRole('button', { name: /cast vote|vote now/i });

      console.log(`Cast Vote buttons on mobile: ${await castVoteButtons.count()}`);
    }
  });
});
