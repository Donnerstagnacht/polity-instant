import { test, expect } from '../fixtures/test-base';

test.describe('Group Documents - Loading States', () => {
  test('Documents list page renders after loading', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: `Test Group ${Date.now()}` });
    await page.goto(`/group/${group.id}/editor`);
    await page.waitForLoadState('networkidle');

    const hasContent = await page.locator('main, [role="main"]').isVisible().catch(() => false);
    expect(hasContent).toBeTruthy();
  });

  test('Loading indicators resolve', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    test.setTimeout(60000);
    const group = await groupFactory.createGroup(mainUserId, { name: `Test Group ${Date.now()}` });
    await page.goto(`/group/${group.id}/editor`);
    await page.waitForLoadState('networkidle');

    const loadingIndicators = page.locator(
      '[class*="animate-spin"], [class*="skeleton"], [aria-busy="true"]'
    );
    const count = await loadingIndicators.count();
    for (let i = 0; i < count; i++) {
      await expect(loadingIndicators.nth(i)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('Documents list or empty state shown', async ({ authenticatedPage: page, groupFactory, mainUserId }) => {
    const group = await groupFactory.createGroup(mainUserId, { name: `Test Group ${Date.now()}` });
    await page.goto(`/group/${group.id}/editor`);

    // Wait for PermissionGuard + GroupDocumentsList to finish loading
    // The page will show either documents heading, AccessDenied, or content
    const documentsHeading = page.getByRole('heading', { name: /documents/i });
    const accessDenied = page.getByText(/access denied/i);
    const createButton = page.getByRole('button', { name: /create|new|add/i });

    await expect(
      documentsHeading.or(accessDenied).or(createButton).first()
    ).toBeVisible({ timeout: 30000 });
  });
});
