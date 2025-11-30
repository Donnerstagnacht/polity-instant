// spec: e2e/test-plans/todos-test-plan.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers/auth';

test.describe('Todos - Create New Todo', () => {
  test('User creates a new todo item', async ({ page }) => {
    // 1. Navigate to /todos
    await loginAsTestUser(page);
    await page.goto('/todos');

    // 2. Click "Create Todo" or "New Todo" button
    const createButton = page
      .getByRole('button', { name: /create/i })
      .or(page.getByRole('button', { name: /new todo/i }));
    await createButton.first().click();

    // 3. Todo creation form or dialog appears
    const titleInput = page.getByLabel(/title/i).or(page.getByPlaceholder(/title/i));
    await expect(titleInput.first()).toBeVisible();

    // 4. Fill in todo details
    await titleInput.first().fill('New test todo item');

    const descriptionInput = page
      .getByLabel(/description/i)
      .or(page.getByPlaceholder(/description/i));
    if ((await descriptionInput.count()) > 0) {
      await descriptionInput.first().fill('This is a test todo');
    }

    // 5. Set priority and status if available
    const prioritySelect = page.getByRole('combobox', { name: /priority/i });
    if ((await prioritySelect.count()) > 0) {
      await prioritySelect.click();
      const highOption = page.getByRole('option', { name: /high/i });
      await highOption.click();
    }

    // 6. Submit the form
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    // 7. New todo appears in the list
    await page.waitForTimeout(500);
    await expect(page.getByText('New test todo item')).toBeVisible();
  });
});
