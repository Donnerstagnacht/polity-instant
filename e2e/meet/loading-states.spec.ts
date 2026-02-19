import { test, expect } from '../fixtures/test-base';

test.describe('Meet - Loading States', () => {
  test('Meeting page renders after loading', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    // Create a meeting slot via adminDb
    const meetingId = crypto.randomUUID();
    const now = new Date();
    const startTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000);

    await adminDb.transact(
      adminDb.tx.meetingSlots[meetingId]
        .update({
          title: 'E2E Test Meeting',
          description: 'Meeting for E2E loading test',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isPublic: true,
          isAvailable: true,
          meetingType: 'public-meeting',
          createdAt: now,
          updatedAt: now,
        })
        .link({ owner: mainUserId })
    );

    await page.goto(`/meet/${meetingId}`);
    await page.waitForLoadState('domcontentloaded');

    // Meeting page should render with the title
    const meetingTitle = page.getByText('E2E Test Meeting');
    await expect(meetingTitle).toBeVisible({ timeout: 15000 });
  });

  test('Loading indicators resolve', async ({
    authenticatedPage: page,
    mainUserId,
    adminDb,
  }) => {
    const meetingId = crypto.randomUUID();
    const now = new Date();
    const startTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const endTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000);

    await adminDb.transact(
      adminDb.tx.meetingSlots[meetingId]
        .update({
          title: 'E2E Loading Indicator Meeting',
          description: '',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          isPublic: true,
          isAvailable: true,
          meetingType: 'one-on-one',
          createdAt: now,
          updatedAt: now,
        })
        .link({ owner: mainUserId })
    );

    await page.goto(`/meet/${meetingId}`);

    // Loading indicator should appear and then resolve
    const loadingText = page.getByText(/loading meeting/i);
    // Wait for loading to disappear (meeting data loaded)
    await expect(loadingText).toBeHidden({ timeout: 15000 });

    // Page should show meeting content
    const meetingTitle = page.getByText('E2E Loading Indicator Meeting');
    await expect(meetingTitle).toBeVisible({ timeout: 5000 });
  });

  test('Meeting not found state shown for invalid ID', async ({
    authenticatedPage: page,
  }) => {
    await page.goto('/meet/00000000-0000-4000-8000-000000000099');
    await page.waitForLoadState('domcontentloaded');

    // Should show "not found" message
    const notFoundText = page.getByText(/not found/i);
    await expect(notFoundText.first()).toBeVisible({ timeout: 15000 });
  });
});
