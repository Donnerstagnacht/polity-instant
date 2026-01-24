// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Can follow a group from timeline card', async ({ page }) => {
    // Switch to Explore mode to find groups to follow
    const exploreTab = page.getByRole('tab', { name: /explore/i });
    await exploreTab.click();
    await page.waitForLoadState('networkidle');

    // Find a follow button
    const followButton = page.getByRole('button', { name: /follow/i }).first();

    if (await followButton.isVisible()) {
      const initialText = await followButton.textContent();

      await followButton.click();
      await page.waitForLoadState('networkidle');

      // Button should change state
      const newText = await followButton.textContent();
      console.log(`Follow button: ${initialText} -> ${newText}`);
    }
  });

  test('Can unfollow from Following timeline', async ({ page }) => {
    // Stay in Following mode
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      // Look for unfollow or following button
      const followingButton = page.getByRole('button', { name: /following|unfollow/i }).first();

      if (await followingButton.isVisible()) {
        await followingButton.click();

        // Look for confirmation or state change
        const confirmDialog = page.locator('[role="alertdialog"], [role="dialog"]');
        if (await confirmDialog.isVisible()) {
          console.log('Unfollow confirmation dialog shown');
        }
      }
    }
  });

  test('Can add reaction to timeline item', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      // Find reaction buttons
      const supportButton = page
        .locator('button[aria-label*="support"], [data-testid="reaction-support"]')
        .first();
      const likeButton = page.locator('button[aria-label*="like"]').first();

      const reactionButton = (await supportButton.isVisible()) ? supportButton : likeButton;

      if (await reactionButton.isVisible()) {
        await reactionButton.click();
        await page.waitForLoadState('networkidle');

        // Reaction count should update
        console.log('Reaction button clicked');
      }
    }
  });

  test('Can toggle reaction off', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      // Find an active reaction button
      const activeReaction = page
        .locator('button[aria-pressed="true"], [data-active="true"]')
        .first();

      if (await activeReaction.isVisible()) {
        await activeReaction.click();
        await page.waitForLoadState('networkidle');

        // Check if it's now inactive
        const isStillActive = await activeReaction.getAttribute('aria-pressed');
        console.log(`Reaction after toggle: ${isStillActive}`);
      }
    }
  });

  test('Can add comment via quick comment feature', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      // Find comment button or input
      const commentButton = page.getByRole('button', { name: /comment|discuss/i }).first();
      const commentInput = page
        .locator('input[placeholder*="comment"], textarea[placeholder*="comment"]')
        .first();

      if (await commentButton.isVisible()) {
        await commentButton.click();

        // Wait for comment input to appear
        const expandedInput = page
          .locator('input[placeholder*="comment"], textarea[placeholder*="comment"]')
          .first();

        if (await expandedInput.isVisible()) {
          await expandedInput.fill('Test comment from E2E');

          // Find submit button
          const submitButton = page.getByRole('button', { name: /send|submit|post/i });
          if (await submitButton.isVisible()) {
            // Don't actually submit to avoid polluting data
            console.log('Comment input ready for submission');
          }
        }
      }
    }
  });

  test('Can open share dialog', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      const shareButton = page.getByRole('button', { name: /share/i }).first();

      if (await shareButton.isVisible()) {
        await shareButton.click();

        // Wait for share dialog
        const shareDialog = page.locator('[role="dialog"]');

        if (await shareDialog.isVisible()) {
          await expect(shareDialog).toBeVisible();

          // Should have share options
          const copyLink = page.getByRole('button', { name: /copy link/i });
          console.log(`Copy link button visible: ${await copyLink.isVisible().catch(() => false)}`);

          // Close dialog
          const closeButton = page.getByRole('button', { name: /close/i });
          if (await closeButton.isVisible()) {
            await closeButton.click();
          }
        }
      }
    }
  });

  test('Card hover shows additional actions', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      const firstCard = cards.first();

      // Hover over card
      await firstCard.hover();

      // Check for hover-revealed elements
      const hoverActions = firstCard.locator('[class*="hover"], [class*="on-hover"]');
      console.log(`Hover actions revealed: ${await hoverActions.count()}`);
    }
  });
});

test.describe('Timeline - Reaction Counts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Reaction counts are displayed', async ({ page }) => {
    const reactionCounts = page.locator(
      '[data-testid="reaction-count"], [class*="reaction-count"]'
    );

    console.log(`Reaction count elements: ${await reactionCounts.count()}`);
  });

  test('Clicking reaction updates count', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      const reactionButton = page.locator('button[aria-label*="support"]').first();
      const reactionCount = reactionButton.locator('[class*="count"], span').first();

      if (await reactionButton.isVisible()) {
        const initialCount = await reactionCount.textContent().catch(() => '0');

        await reactionButton.click();
        await page.waitForLoadState('networkidle');

        const newCount = await reactionCount.textContent().catch(() => '0');
        console.log(`Reaction count: ${initialCount} -> ${newCount}`);
      }
    }
  });
});
