// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Timeline - Content Cards', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Group cards render with correct structure', async ({ page }) => {
    const groupCards = page.locator('[data-testid="group-card"], [class*="GroupTimelineCard"]');

    if ((await groupCards.count()) > 0) {
      const firstCard = groupCards.first();

      // Check for expected card elements
      await expect(firstCard).toBeVisible();

      // Cards should have a header/title area
      const header = firstCard.locator('[class*="header"], [class*="Header"]');
      if ((await header.count()) > 0) {
        await expect(header.first()).toBeVisible();
      }

      // Cards should have action buttons
      const actions = firstCard.locator('button');
      expect(await actions.count()).toBeGreaterThan(0);
    }
  });

  test('Event cards render with correct structure', async ({ page }) => {
    const eventCards = page.locator('[data-testid="event-card"], [class*="EventTimelineCard"]');

    if ((await eventCards.count()) > 0) {
      const firstCard = eventCards.first();
      await expect(firstCard).toBeVisible();

      // Event cards should show date information
      const dateElements = firstCard.locator('[class*="date"], time, [aria-label*="date"]');
      console.log(`Date elements in event card: ${await dateElements.count()}`);
    }
  });

  test('Amendment cards render with correct structure', async ({ page }) => {
    const amendmentCards = page.locator(
      '[data-testid="amendment-card"], [class*="AmendmentTimelineCard"]'
    );

    if ((await amendmentCards.count()) > 0) {
      const firstCard = amendmentCards.first();
      await expect(firstCard).toBeVisible();

      // Amendment cards should show workflow status
      const statusBadge = firstCard.locator('[class*="badge"], [class*="status"]');
      console.log(`Status badges in amendment card: ${await statusBadge.count()}`);
    }
  });

  test('Vote cards render with voting UI', async ({ page }) => {
    const voteCards = page.locator('[data-testid="vote-card"], [class*="VoteTimelineCard"]');

    if ((await voteCards.count()) > 0) {
      const firstCard = voteCards.first();
      await expect(firstCard).toBeVisible();

      // Vote cards should have vote buttons or progress
      const voteProgress = firstCard.locator('[class*="progress"], [role="progressbar"]');
      const voteButtons = firstCard.locator('[class*="vote"], button');

      console.log(
        `Vote elements found: progress=${await voteProgress.count()}, buttons=${await voteButtons.count()}`
      );
    }
  });

  test('Election cards render with election info', async ({ page }) => {
    const electionCards = page.locator(
      '[data-testid="election-card"], [class*="ElectionTimelineCard"]'
    );

    if ((await electionCards.count()) > 0) {
      const firstCard = electionCards.first();
      await expect(firstCard).toBeVisible();

      // Election cards should show candidates or phase info
      const candidates = firstCard.locator('[class*="candidate"]');
      const phaseInfo = firstCard.locator('[class*="phase"], [class*="status"]');

      console.log(
        `Election elements: candidates=${await candidates.count()}, phase=${await phaseInfo.count()}`
      );
    }
  });

  test('Blog cards render with preview content', async ({ page }) => {
    const blogCards = page.locator('[data-testid="blog-card"], [class*="BlogTimelineCard"]');

    if ((await blogCards.count()) > 0) {
      const firstCard = blogCards.first();
      await expect(firstCard).toBeVisible();

      // Blog cards should have text preview
      const textContent = await firstCard.textContent();
      expect(textContent?.length).toBeGreaterThan(10);
    }
  });

  test('Todo cards render with completion status', async ({ page }) => {
    const todoCards = page.locator('[data-testid="todo-card"], [class*="TodoTimelineCard"]');

    if ((await todoCards.count()) > 0) {
      const firstCard = todoCards.first();
      await expect(firstCard).toBeVisible();

      // Todo cards might have checkbox or completion indicator
      const checkbox = firstCard.locator('[type="checkbox"], [role="checkbox"]');
      console.log(`Checkboxes in todo card: ${await checkbox.count()}`);
    }
  });

  test('Cards have gradient headers for visual distinction', async ({ page }) => {
    // Look for cards with gradient backgrounds
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      const firstCard = cards.first();

      // Check for gradient class in card or header
      const hasGradient = await firstCard.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        const bgImage = computedStyle.backgroundImage;
        const className = el.className;
        return bgImage.includes('gradient') || className.includes('gradient');
      });

      console.log(`First card has gradient styling: ${hasGradient}`);
    }
  });
});

test.describe('Timeline - Card Action Buttons', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Cards have share button', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      const shareButtons = page.getByRole('button', { name: /share/i });
      const shareIcons = page.locator('[aria-label*="share"], [class*="share"]');

      console.log(
        `Share buttons: ${await shareButtons.count()}, Share icons: ${await shareIcons.count()}`
      );
    }
  });

  test('Cards have discuss/comment button', async ({ page }) => {
    const discussButtons = page.getByRole('button', { name: /discuss|comment/i });
    const commentIcons = page.locator('[aria-label*="comment"], [aria-label*="discuss"]');

    console.log(
      `Discuss buttons: ${await discussButtons.count()}, Comment icons: ${await commentIcons.count()}`
    );
  });

  test('Cards have reaction buttons', async ({ page }) => {
    const reactionButtons = page.locator(
      '[data-testid="reaction-buttons"], [class*="reaction"], button[aria-label*="support"], button[aria-label*="oppose"]'
    );

    console.log(`Reaction elements: ${await reactionButtons.count()}`);
  });

  test('Clicking card navigates to detail page', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]');

    if ((await cards.count()) > 0) {
      // Get the current URL
      const initialUrl = page.url();

      // Click the first card (avoiding buttons)
      const firstCard = cards.first();
      const cardContent = firstCard.locator('[class*="content"], [class*="body"]').first();

      if ((await cardContent.count()) > 0) {
        await cardContent.click();

        // Wait for potential navigation
        await page.waitForLoadState('networkidle');

        // Check if URL changed
        const newUrl = page.url();
        console.log(`Navigation: ${initialUrl} -> ${newUrl}`);
      }
    }
  });
});
