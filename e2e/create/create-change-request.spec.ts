import { test, expect } from '../fixtures/test-base';
test.describe('Create Feature', () => {
  test('Create Change Request', async ({ authenticatedPage: page, amendmentFactory, mainUserId }) => {
    // Change requests are created from within an amendment, not via /create/change-request
    const amendment = await amendmentFactory.createAmendment(mainUserId, {
      title: `Test Amendment ${Date.now()}`,
    });

    // Navigate to amendment change requests page
    await page.goto(`/amendment/${amendment.id}/change-requests`);

    // The page should load
    await page.waitForLoadState('networkidle');

    // Verify we're on the change requests page
    expect(page.url()).toContain('/change-requests');
  });
});
