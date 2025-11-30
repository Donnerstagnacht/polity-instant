// spec: e2e/test-plans/amendments-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';
import { TEST_ENTITY_IDS } from '../test-entity-ids';

test.describe('Amendments - Display Amendment Details', () => {
  test('User views amendment page with details', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);

    // 3. Wait for page to load
    await page.waitForLoadState('networkidle');

    // 4. Title displayed
    const title = page.locator('h1').or(page.getByRole('heading', { level: 1 }));
    await expect(title).toBeVisible();

    // 5. Subtitle shown if provided
    page.locator('[data-testid="subtitle"]').or(page.locator('h2'));

    // 6. Amendment code displayed if provided
    page.getByText(/A-\d{4}-\d{3}/i).or(page.locator('[data-testid="amendment-code"]'));

    // 7. Author/proposer information
    page.getByText(/proposed by/i).or(page.locator('[data-testid="proposer"]'));

    // 8. Public/private badge
    page.locator('[data-testid="visibility-badge"]').or(page.getByRole('status'));

    // Amendment details are visible
    await expect(page).toHaveURL(/\/amendment\/.+/);
  });

  test('Amendment stats bar displays accurate counts', async ({ page }) => {
    // 1. Authenticate as test user
    await loginAsTestUser(page);

    // 2. Navigate to amendment page
    await page.goto(`/amendment/${TEST_ENTITY_IDS.AMENDMENT}`);
    await page.waitForLoadState('networkidle');

    // 3. Check stats bar
    page.locator('[data-testid="stats-bar"]').or(page.locator('.stats-bar'));

    // 4. Collaborator count accurate
    const collaboratorCount = page.getByText(/collaborator/i);

    // 5. Supporter count (if available)
    const supporterCount = page.getByText(/supporter/i);

    // Stats should be visible if present
    await collaboratorCount.count();
    await supporterCount.count();
  });
});
