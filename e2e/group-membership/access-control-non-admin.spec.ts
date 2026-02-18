// spec: e2e/test-plans/group-membership-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Group Membership - Access Control', () => {
  test('Non-admin cannot access membership management page', async ({ authenticatedPage: page }) => {
    // 1. Authenticate as non-admin user
    // 2. Try to access memberships management page directly
    await page.goto(`/group/${TEST_ENTITY_IDS.testGroup1}/memberships`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // 3. Verify access is denied — app may show "access denied" text,
    //    a perpetual loading spinner, or simply not render membership management content.
    const accessDenied = page.getByText(/access denied|unauthorized|forbidden|not authorized/i);
    const membersHeading = page.getByRole('heading', { name: /members/i });
    const inviteButton = page.getByRole('button', { name: /invite/i });

    const hasAccessDenied = await accessDenied.isVisible().catch(() => false);
    const hasMembersHeading = await membersHeading.first().isVisible().catch(() => false);
    const hasInviteButton = await inviteButton.first().isVisible().catch(() => false);

    // Either explicit access denied, or membership management UI is not rendered
    expect(hasAccessDenied || (!hasMembersHeading && !hasInviteButton)).toBeTruthy();
  });
});
