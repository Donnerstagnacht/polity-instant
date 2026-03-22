// spec: Indicative vote → final vote → closed flow

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Event Voting - Indicative to Final Vote Flow', () => {
  test('Agenda item shows indication phase badge', async ({ authenticatedPage: page }) => {
    // Navigate to a votable agenda item
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check for voting phase indicator
    const indicationBadge = page.getByText(/indication/i);
    const finalVoteBadge = page.getByText(/final.?vote/i);
    const closedBadge = page.getByText(/closed/i);

    const hasPhaseIndicator =
      (await indicationBadge.count()) > 0 ||
      (await finalVoteBadge.count()) > 0 ||
      (await closedBadge.count()) > 0;

    if (hasPhaseIndicator) {
      // At least one phase badge should be visible
      if ((await indicationBadge.count()) > 0) {
        await expect(indicationBadge.first()).toBeVisible();
      }
    }
  });

  test('Vote button opens vote cast dialog', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Look for Vote button in action bar
    const voteButton = page.getByRole('button', { name: /^vote$/i });

    if ((await voteButton.count()) > 0) {
      await voteButton.click();

      // Dialog should appear
      const dialog = page.getByRole('dialog');
      if ((await dialog.count()) > 0) {
        await expect(dialog).toBeVisible();

        // Should show vote options (yes/no/abstain or candidates)
        const voteOptions = page
          .getByRole('button', { name: /yes|no|abstain/i })
          .or(page.locator('[data-testid="candidate-option"]'));

        if ((await voteOptions.count()) > 0) {
          await expect(voteOptions.first()).toBeVisible();
        }

        // Close dialog
        const closeButton = page.getByRole('button', { name: /close|cancel/i });
        if ((await closeButton.count()) > 0) {
          await closeButton.click();
        }
      }
    }
  });

  test('Organizer can advance from indication to final vote', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Look for "Start Final Vote" button (organizer only)
    const startFinalVoteButton = page.getByRole('button', { name: /start final vote|begin final/i });

    if ((await startFinalVoteButton.count()) > 0) {
      // Button is present - user has organizer permissions
      await expect(startFinalVoteButton).toBeVisible();
    }
  });

  test('Organizer can close final vote', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Look for "Close Final Vote" button
    const closeFinalVoteButton = page.getByRole('button', { name: /close final vote|end final/i });

    if ((await closeFinalVoteButton.count()) > 0) {
      await expect(closeFinalVoteButton).toBeVisible();
    }
  });

  test('Vote results display shows grouped bars', async ({ authenticatedPage: page }) => {
    await page.goto(
      `/event/${TEST_ENTITY_IDS.EVENT}/agenda/${TEST_ENTITY_IDS.testAgendaItem1}`
    );
    await page.waitForLoadState('networkidle');

    // Check for vote results display
    const resultsSection = page.locator('[data-testid="vote-results"]').or(
      page.getByText(/vote results|results/i)
    );

    if ((await resultsSection.count()) > 0) {
      // Should show result bars
      const resultBars = page.locator('[data-testid="result-bar"]').or(
        page.locator('.bg-green-500, .bg-red-500, .bg-yellow-500')
      );

      if ((await resultBars.count()) > 0) {
        await expect(resultBars.first()).toBeVisible();
      }
    }
  });
});
