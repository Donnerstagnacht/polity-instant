// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication State Detection', () => {
  test('Verify Session/Cookie Absence', async ({ page }) => {
    // 1. Do NOT authenticate

    // 2. Navigate to any page
    await page.goto('/');
    await page.waitForURL('**', { timeout: 5000 });

    // 3. Check browser cookies
    const cookies = await page.context().cookies();

    // 4. Verify no authentication tokens are present
    const authCookies = cookies.filter(
      cookie =>
        cookie.name.toLowerCase().includes('auth') ||
        cookie.name.toLowerCase().includes('token') ||
        cookie.name.toLowerCase().includes('session')
    );

    // 5. Verify no session cookies exist
    expect(authCookies.length).toBe(0);

    console.log(`Total cookies: ${cookies.length}, Auth cookies: ${authCookies.length}`);
  });
});
