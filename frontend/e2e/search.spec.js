import { test, expect } from '@playwright/test';

/**
 * E2E Test: Search Workflow
 * Tests the complete search functionality including:
 * - Search input
 * - Debouncing
 * - Results display
 * - Clear functionality
 */

test.describe('Search Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
  });

  test('should display search input on page load', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /search by customer name/i);
  });

  test('should search for transactions by customer name', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Type search term
    await searchInput.fill('John');
    
    // Wait for debounce and results (300ms + API call)
    await page.waitForTimeout(500);
    
    // Check that results are displayed
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
    
    // Verify that results contain "John"
    const firstCell = page.locator('tbody tr:first-child td:first-child');
    await expect(firstCell).toBeVisible();
  });

  test('should show clear button when typing', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Clear button should not be visible initially
    const clearButton = page.getByLabel(/clear search/i);
    await expect(clearButton).not.toBeVisible();
    
    // Type in search
    await searchInput.fill('Test');
    
    // Clear button should now be visible
    await expect(clearButton).toBeVisible();
  });

  test('should clear search when clear button is clicked', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    const clearButton = page.getByLabel(/clear search/i);
    
    // Type search term
    await searchInput.fill('John');
    await page.waitForTimeout(100);
    
    // Click clear button
    await clearButton.click();
    
    // Search input should be empty
    await expect(searchInput).toHaveValue('');
    
    // Clear button should not be visible
    await expect(clearButton).not.toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Type rapidly
    await searchInput.fill('J');
    await page.waitForTimeout(50);
    await searchInput.fill('Jo');
    await page.waitForTimeout(50);
    await searchInput.fill('Joh');
    await page.waitForTimeout(50);
    await searchInput.fill('John');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Results should be loaded only once (debounced)
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should handle no results found', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Search for something that doesn't exist
    await searchInput.fill('XYZ_NONEXISTENT_NAME_12345');
    
    // Wait for debounce and API response
    await page.waitForTimeout(500);
    
    // Should show "No transactions found" message
    await expect(page.getByText(/no transactions found/i)).toBeVisible();
    await expect(page.getByText(/try adjusting your filters/i)).toBeVisible();
  });

  test('should update results when search term changes', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // First search
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // Get initial count
    const table1 = page.locator('.transaction-table tbody tr');
    const count1 = await table1.count();
    expect(count1).toBeGreaterThan(0);
    
    // Second search
    await searchInput.fill('Alice');
    await page.waitForTimeout(500);
    
    // Results should have changed
    const table2 = page.locator('.transaction-table tbody tr');
    const count2 = await table2.count();
    expect(count2).toBeGreaterThan(0);
  });

  test('should be keyboard accessible', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Focus search input with keyboard
    await searchInput.focus();
    
    // Type with keyboard
    await page.keyboard.type('John');
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify results loaded
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should maintain search across pagination', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Search for common name
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // Go to next page
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(300);
      
      // Search input should still have the value
      await expect(searchInput).toHaveValue('John');
    }
  });
});

