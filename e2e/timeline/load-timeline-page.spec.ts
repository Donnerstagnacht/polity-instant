// spec: e2e/test-plans/timeline-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
import { gotoHomeAndDismissDialog } from '../helpers/navigation';
test.describe('Timeline - Load Timeline Page', () => {
  test('Authenticated user loads home page with timeline', async ({ authenticatedPage: page }) => {
    // 1. User logs in
    // 2. User navigates to home page (/)
    await gotoHomeAndDismissDialog(page);

    // 3. Timeline component loads
    // 4. Shows "Your Political Ecosystem" heading
    await expect(page.getByText(/your political ecosystem/i)).toBeVisible({ timeout: 15000 });

    // 5. Verify timeline header is visible with mode tabs (Following / Decisions)
    const followingTab = page.getByRole('tab', { name: /following/i });
    await expect(followingTab).toBeVisible();
  });
});
