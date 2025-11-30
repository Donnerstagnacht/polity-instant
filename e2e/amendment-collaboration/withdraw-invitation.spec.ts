// spec: e2e/test-plans/amendment-collaboration-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendment Collaboration', () => {
  test('Author can withdraw invitation', async ({ page }) => {
    await loginAsTestUser(page);

    // 1. Author navigates to collaborators page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.testAmendment1}/collaborators`);

    // 2. Author sees pending invitations list
    const pendingInvitations = page.getByText(/pending invitations/i).locator('..');
    await expect(pendingInvitations).toBeVisible();

    const invitationCount = await pendingInvitations
      .locator('.invitation-item, [data-invitation]')
      .count();

    // 3. Author clicks "Withdraw Invitation"
    const withdrawButton = pendingInvitations
      .getByRole('button', { name: /withdraw|cancel/i })
      .first();
    await expect(withdrawButton).toBeVisible();
    await withdrawButton.click();

    // 4. Invitation is deleted
    const newInvitationCount = await pendingInvitations
      .locator('.invitation-item, [data-invitation]')
      .count();
    expect(newInvitationCount).toBe(invitationCount - 1);

    // 5. User can no longer accept invitation
    await expect(page.getByText(/invitation withdrawn/i)).toBeVisible();
  });
});
