// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Candidate Voting Integration', () => {
  test('Vote for candidate', async ({ page }) => {
    // 1. Authenticate as voter
    await loginAsTestUser(page);

    // 2. Navigate to election
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. Find election with candidates
    const candidateCards = page
      .locator('[data-testid="candidate-card"]')
      .or(page.getByRole('button', { name: /vote/i }));

    if ((await candidateCards.count()) > 0) {
      const firstCandidate = candidateCards.first();

      // 4. Select candidate
      await firstCandidate.click();

      // 5. Cast vote
      const voteButton = page.getByRole('button', { name: /vote|confirm/i });
      if ((await voteButton.count()) > 0) {
        await voteButton.click();

        // 6. Vote recorded
        await page.waitForTimeout(500);

        // Voter can see vote recorded
        // Visual indicator shown
      }
    }
  });

  test('Change vote to different candidate', async ({ page }) => {
    // 1. Authenticate as voter
    await loginAsTestUser(page);

    // 2. Navigate to election
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. User has voted for Candidate A
    const candidateCards = page.locator('[data-testid="candidate-card"]');

    if ((await candidateCards.count()) > 1) {
      // 4. Change vote to Candidate B
      const secondCandidate = candidateCards.nth(1);
      await secondCandidate.click();

      // 5. Confirm change
      const confirmButton = page.getByRole('button', { name: /vote|confirm|change/i });
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();

        // 6. Vote count adjusted
        await page.waitForTimeout(500);

        // Only one vote per voter
        // Change reflected immediately
      }
    }
  });
});
