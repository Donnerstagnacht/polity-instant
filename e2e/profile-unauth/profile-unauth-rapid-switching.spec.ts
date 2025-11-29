// spec: e2e/test-plans/profile-unauthenticated-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Edge Cases and Security Considerations', () => {
  test('Rapid Route Switching', async ({ page }) => {
    // 1. Do NOT authenticate

    const routes = [
      '/user/f598596e-d379-413e-9c6e-c218e5e3cf17',
      '/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit',
      '/user',
    ];

    // 2. Rapidly navigate between routes
    for (let i = 0; i < 3; i++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForURL('**', { timeout: 2000 }).catch(() => {
          // Ignore timeout errors during rapid switching
        });
      }
    }

    // Final navigation to check final state
    await page.goto('/user/f598596e-d379-413e-9c6e-c218e5e3cf17/edit');
    await page.waitForURL('**', { timeout: 5000 });

    // 3. Verify consistent redirect behavior
    const finalUrl = page.url();

    // 4. Check for race conditions or exposed content
    // Should consistently redirect to auth for protected routes
    if (finalUrl.includes('/edit')) {
      // If edit page is shown, verify no form is accessible
      const saveButton = page.getByRole('button', { name: /save|update/i });
      const saveCount = await saveButton.count();
      expect(saveCount).toBe(0);
    }
  });
});
