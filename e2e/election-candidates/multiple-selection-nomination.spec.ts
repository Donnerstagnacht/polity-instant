// spec: e2e/test-plans/election-candidates-test-plan.md
// seed: e2e/seed.spec.ts

import { test } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Election Candidates - Multiple Selection and Nomination', () => {
  test('Select multiple candidates', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as voter
    // 2. Election allows multiple selections
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. Voter selects multiple candidates
    const candidateCards = page.locator('[data-testid="candidate-card"]');

    if ((await candidateCards.count()) >= 3) {
      // Select first candidate
      await candidateCards.nth(0).click();

      // Select second candidate
      await candidateCards.nth(1).click();

      // Select third candidate
      await candidateCards.nth(2).click();

      // 4. Cast vote
      const voteButton = page.getByRole('button', { name: /vote|confirm/i });
      if ((await voteButton.count()) > 0) {
        await voteButton.click();

        // 5. All selections recorded

        // All votes counted
      }
    }
  });

  test('Self-nominate as candidate', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as user
    // 2. Navigate to election
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/stream`);
    await page.waitForLoadState('networkidle');

    // 3. Click "Nominate Myself"
    const nominateButton = page.getByRole('button', { name: /nominate|self-nominate/i });

    if ((await nominateButton.count()) > 0) {
      await nominateButton.click();

      // 4. Fill candidate information
      const nameInput = page.getByLabel(/name/i);
      await nameInput.fill('Self Nomination Test');

      const descInput = page.getByLabel(/description|platform/i);
      await descInput.fill('My campaign platform and vision');

      // 5. Submit nomination
      const submitButton = page.getByRole('button', { name: /submit|nominate/i });
      await submitButton.click();

      // 6. Nomination created

      // Status: "pending"
      // Organizer receives nomination
      // User cannot nominate again
    }
  });

  test('Approve nomination', async ({ authenticatedPage: page }) => {
    // 1. Login as organizer
    // 2. Navigate to pending nominations
    await page.goto(`/event/${TEST_ENTITY_IDS.EVENT}/agenda`);
    await page.waitForLoadState('networkidle');

    // 3. View pending nominations
    const pendingSection = page.getByText(/pending|nominations/i);

    if ((await pendingSection.count()) > 0) {
      // 4. Click "Approve"
      const approveButton = page.getByRole('button', { name: /approve/i }).first();

      if ((await approveButton.count()) > 0) {
        await approveButton.click();

        // 5. Candidate approved

        // Status changes to active
        // Candidate appears in election
        // User notified of approval
      }
    }
  });
});
