import { test, expect } from '@playwright/test';

/**
 * E2E Test: Combined Workflow
 * Tests complex user scenarios combining multiple features:
 * - Search + Filter + Sort + Pagination
 * - Real-world user journeys
 * - Complex interactions
 */

test.describe('Combined Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
    await page.waitForTimeout(1000);
  });

  test('should perform search and apply filters together', async ({ page }) => {
    // Search for a name
    const searchInput = page.getByLabel(/search transactions/i);
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // Apply filter
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Both should be active
    await expect(searchInput).toHaveValue('John');
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    
    // Results should reflect both
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should search, filter, and sort together', async ({ page }) => {
    // Search
    await page.getByLabel(/search transactions/i).fill('John');
    await page.waitForTimeout(300);
    
    // Filter
    await page.getByLabel(/filter by male/i).check();
    await page.waitForTimeout(300);
    
    // Sort
    const sortSelect = page.getByLabel(/sort transactions/i);
    await sortSelect.selectOption('quantity-desc');
    await page.waitForTimeout(500);
    
    // All should be active
    await expect(page.getByLabel(/search transactions/i)).toHaveValue('John');
    await expect(page.getByLabel(/filter by male/i)).toBeChecked();
    await expect(sortSelect).toHaveValue('quantity-desc');
    
    // Results displayed
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should handle full workflow: search, filter, sort, paginate', async ({ page }) => {
    // 1. Search
    const searchInput = page.getByLabel(/search transactions/i);
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // 2. Apply multiple filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by electronics category/i).check();
    await page.waitForTimeout(500);
    
    // 3. Sort
    const sortSelect = page.getByLabel(/sort transactions/i);
    await sortSelect.selectOption('date-asc');
    await page.waitForTimeout(500);
    
    // 4. Change page size
    const pageSizeSelect = page.getByLabel(/results per page/i);
    await pageSizeSelect.selectOption('25');
    await page.waitForTimeout(500);
    
    // 5. Navigate pages
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // All settings should be maintained
      await expect(searchInput).toHaveValue('John');
      await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
      await expect(page.getByLabel(/filter by electronics category/i)).toBeChecked();
      await expect(sortSelect).toHaveValue('date-asc');
      await expect(pageSizeSelect).toHaveValue('25');
    }
  });

  test('should clear search while maintaining filters', async ({ page }) => {
    // Apply search and filter
    const searchInput = page.getByLabel(/search transactions/i);
    await searchInput.fill('John');
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Clear search
    await page.getByLabel(/clear search/i).click();
    await page.waitForTimeout(500);
    
    // Filter should still be active
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(searchInput).toHaveValue('');
  });

  test('should clear filters while maintaining search', async ({ page }) => {
    // Apply search and filters
    const searchInput = page.getByLabel(/search transactions/i);
    await searchInput.fill('John');
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.waitForTimeout(500);
    
    // Clear all filters
    await page.getByText('Clear All').click();
    await page.waitForTimeout(500);
    
    // Search should still be active
    await expect(searchInput).toHaveValue('John');
    await expect(page.getByLabel(/filter by north region/i)).not.toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).not.toBeChecked();
  });

  test('should handle changing sort with active search and filters', async ({ page }) => {
    // Setup: search + filter
    await page.getByLabel(/search transactions/i).fill('John');
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Change sort multiple times
    const sortSelect = page.getByLabel(/sort transactions/i);
    
    await sortSelect.selectOption('quantity-desc');
    await page.waitForTimeout(300);
    
    await sortSelect.selectOption('customerName-asc');
    await page.waitForTimeout(300);
    
    await sortSelect.selectOption('date-desc');
    await page.waitForTimeout(300);
    
    // Search and filter should still be active
    await expect(page.getByLabel(/search transactions/i)).toHaveValue('John');
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
  });

  test('should handle age range with other filters', async ({ page }) => {
    // Apply age range
    await page.getByLabel(/minimum age/i).fill('25');
    await page.getByLabel(/maximum age/i).fill('50');
    await page.waitForTimeout(300);
    
    // Add other filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.waitForTimeout(500);
    
    // All should be active
    await expect(page.getByLabel(/minimum age/i)).toHaveValue('25');
    await expect(page.getByLabel(/maximum age/i)).toHaveValue('50');
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).toBeChecked();
  });

  test('should handle complex filter combinations', async ({ page }) => {
    // Apply filters from every category
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by south region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.getByLabel(/filter by female/i).check();
    await page.getByLabel(/minimum age/i).fill('18');
    await page.getByLabel(/maximum age/i).fill('65');
    await page.getByLabel(/filter by electronics category/i).check();
    await page.getByLabel(/filter by credit card/i).check();
    await page.waitForTimeout(700);
    
    // All filters should be active
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by south region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).toBeChecked();
    await expect(page.getByLabel(/filter by female/i)).toBeChecked();
    await expect(page.getByLabel(/filter by electronics category/i)).toBeChecked();
    await expect(page.getByLabel(/filter by credit card/i)).toBeChecked();
  });

  test('should maintain state when navigating away from page 1 and back', async ({ page }) => {
    // Apply search and filter
    await page.getByLabel(/search transactions/i).fill('John');
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Go back to page 1
      const previousButton = page.getByLabel(/go to previous page/i);
      await previousButton.click();
      await page.waitForTimeout(500);
      
      // Everything should still be active
      await expect(page.getByLabel(/search transactions/i)).toHaveValue('John');
      await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    }
  });

  test('should handle rapid state changes', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    const sortSelect = page.getByLabel(/sort transactions/i);
    
    // Rapid changes
    await searchInput.fill('J');
    await page.getByLabel(/filter by north region/i).check();
    await sortSelect.selectOption('quantity-desc');
    await searchInput.fill('Jo');
    await page.getByLabel(/filter by male/i).check();
    await searchInput.fill('Joh');
    await sortSelect.selectOption('date-asc');
    await searchInput.fill('John');
    await page.waitForTimeout(700);
    
    // Final state should be correct
    await expect(searchInput).toHaveValue('John');
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).toBeChecked();
    await expect(sortSelect).toHaveValue('date-asc');
    
    // Page should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should reset properly after clearing everything', async ({ page }) => {
    // Apply everything
    await page.getByLabel(/search transactions/i).fill('John');
    await page.getByLabel(/filter by north region/i).check();
    const sortSelect = page.getByLabel(/sort transactions/i);
    await sortSelect.selectOption('quantity-desc');
    await page.waitForTimeout(500);
    
    // Clear search
    await page.getByLabel(/clear search/i).click();
    await page.waitForTimeout(300);
    
    // Clear filters
    await page.getByText('Clear All').click();
    await page.waitForTimeout(300);
    
    // Reset sort
    await sortSelect.selectOption('date-desc');
    await page.waitForTimeout(500);
    
    // Everything should be in default state
    await expect(page.getByLabel(/search transactions/i)).toHaveValue('');
    await expect(page.getByLabel(/filter by north region/i)).not.toBeChecked();
    await expect(sortSelect).toHaveValue('date-desc');
  });

  test('should handle sort changes during pagination', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    const sortSelect = page.getByLabel(/sort transactions/i);
    
    if (await nextButton.isEnabled()) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Change sort (should reset to page 1 potentially)
      await sortSelect.selectOption('quantity-desc');
      await page.waitForTimeout(500);
      
      // Application should handle this gracefully
      await expect(page.locator('.transaction-table')).toBeVisible();
    }
  });
});

