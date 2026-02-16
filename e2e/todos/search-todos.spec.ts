// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '../fixtures/test-base';
test.describe('Todos - Search Todos', () => {
  test('User searches for todos by title or description', async ({ authenticatedPage: page }) => {
    // 1. Navigate to /todos
    await page.goto('/todos');

    // 2. Locate search input field
    const searchInput = page.getByPlaceholder(/search/i).or(page.getByRole('searchbox'));
    await expect(searchInput.first()).toBeVisible();

    // 3. Type search query
    await searchInput.first().fill('meeting');

    // 4. Wait for search results (debounced)

    // 5. Only matching todos are displayed
    // Results should contain the search term
    // 6. Clear search to show all todos
    await searchInput.first().clear();

    // All todos displayed again
  });
});
