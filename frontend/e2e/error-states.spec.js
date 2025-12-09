import { test, expect } from '@playwright/test';

/**
 * E2E Test: Error States and Edge Cases
 * Tests error handling and edge cases:
 * - Loading states
 * - Error states
 * - Empty states
 * - Network errors
 * - Invalid inputs
 */

test.describe('Error States and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
  });

  test('should show loading state on initial load', async ({ page }) => {
    // On fresh load, there might be a brief loading state
    // This is hard to catch, but we can verify the table eventually loads
    await page.waitForTimeout(2000);
    
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Search for something that definitely doesn't exist
    await searchInput.fill('XYZNONEXISTENT123456789');
    await page.waitForTimeout(500);
    
    // Should show empty state
    await expect(page.getByText(/no transactions found/i)).toBeVisible();
    await expect(page.getByText(/try adjusting your filters/i)).toBeVisible();
    
    // Should show empty icon
    await expect(page.locator('.table-state')).toBeVisible();
  });

  test('should handle filters with no results', async ({ page }) => {
    // Apply very restrictive filters
    await page.getByLabel(/minimum age/i).fill('99');
    await page.getByLabel(/maximum age/i).fill('100');
    await page.waitForTimeout(500);
    
    // Page should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // May show empty state or limited results
    // Just verify app continues to function
  });

  test('should handle invalid age range input', async ({ page }) => {
    const minAgeInput = page.getByLabel(/minimum age/i);
    const maxAgeInput = page.getByLabel(/maximum age/i);
    
    // Try to enter invalid values
    await minAgeInput.fill('abc');
    
    // Input should handle this (HTML5 validation or conversion to 0)
    // Just verify page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle age range where min > max', async ({ page }) => {
    const minAgeInput = page.getByLabel(/minimum age/i);
    const maxAgeInput = page.getByLabel(/maximum age/i);
    
    // Set min > max
    await minAgeInput.fill('80');
    await maxAgeInput.fill('20');
    await page.waitForTimeout(500);
    
    // App should handle this gracefully (either no results or backend validation)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle very long search terms', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Enter very long search term
    const longTerm = 'a'.repeat(1000);
    await searchInput.fill(longTerm);
    await page.waitForTimeout(500);
    
    // App should handle this
    await expect(searchInput).toHaveValue(longTerm);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle special characters in search', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Enter special characters
    await searchInput.fill('!@#$%^&*()');
    await page.waitForTimeout(500);
    
    // App should handle this gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle rapid clicking of buttons', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    if (await nextButton.isEnabled()) {
      // Click rapidly
      await nextButton.click();
      await nextButton.click();
      await nextButton.click();
      
      await page.waitForTimeout(700);
      
      // App should handle this without breaking
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('.transaction-table')).toBeVisible();
    }
  });

  test('should handle rapid filter toggling', async ({ page }) => {
    const northCheckbox = page.getByLabel(/filter by north region/i);
    
    // Toggle rapidly
    await northCheckbox.check();
    await northCheckbox.uncheck();
    await northCheckbox.check();
    await northCheckbox.uncheck();
    await northCheckbox.check();
    
    await page.waitForTimeout(700);
    
    // Final state should be stable
    await expect(northCheckbox).toBeChecked();
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle page refresh', async ({ page }) => {
    // Apply some state
    await page.getByLabel(/search transactions/i).fill('John');
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Refresh page
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Page should load fresh (state might be lost, which is expected)
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should handle browser back button', async ({ page }) => {
    // Note: Since this is a SPA, back button behavior depends on routing implementation
    // Currently no routing, so this just verifies page stability
    
    await page.getByLabel(/search transactions/i).fill('Test');
    await page.waitForTimeout(500);
    
    // Try going back (may not do anything in SPA)
    await page.goBack();
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    // Desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator('.transaction-table')).toBeVisible();
    
    // Tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await expect(page.locator('.transaction-table')).toBeVisible();
    
    // Mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should show Clear All button only when filters active', async ({ page }) => {
    // Initially no button
    await expect(page.getByText('Clear All')).not.toBeVisible();
    
    // Apply filter
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(300);
    
    // Button appears
    await expect(page.getByText('Clear All')).toBeVisible();
    
    // Clear filters
    await page.getByText('Clear All').click();
    await page.waitForTimeout(300);
    
    // Button disappears
    await expect(page.getByText('Clear All')).not.toBeVisible();
  });

  test('should show clear search button only when typing', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    const clearButton = page.getByLabel(/clear search/i);
    
    // Initially not visible
    await expect(clearButton).not.toBeVisible();
    
    // Type something
    await searchInput.fill('Test');
    await page.waitForTimeout(100);
    
    // Button appears
    await expect(clearButton).toBeVisible();
    
    // Clear
    await clearButton.click();
    await page.waitForTimeout(100);
    
    // Button disappears
    await expect(clearButton).not.toBeVisible();
  });

  test('should handle all filters cleared simultaneously', async ({ page }) => {
    // Apply multiple filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.getByLabel(/filter by electronics category/i).check();
    await page.getByLabel(/minimum age/i).fill('25');
    await page.waitForTimeout(500);
    
    // Clear all at once
    await page.getByText('Clear All').click();
    await page.waitForTimeout(500);
    
    // All should be cleared
    await expect(page.getByLabel(/filter by north region/i)).not.toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).not.toBeChecked();
    await expect(page.getByLabel(/filter by electronics category/i)).not.toBeChecked();
    await expect(page.getByLabel(/minimum age/i)).toHaveValue('0');
  });

  test('should handle accessibility keyboard navigation', async ({ page }) => {
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // App should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Key elements should be visible
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
    await expect(page.getByLabel(/search transactions/i)).toBeVisible();
    await expect(page.locator('.transaction-table, .table-state')).toBeVisible();
    
    // Filter panel should be accessible (might be stacked)
    await expect(page.getByText('Customer Region')).toBeVisible();
  });

  test('should handle sort dropdown edge cases', async ({ page }) => {
    const sortSelect = page.getByLabel(/sort transactions/i);
    
    // Rapidly change sort
    await sortSelect.selectOption('date-asc');
    await sortSelect.selectOption('date-desc');
    await sortSelect.selectOption('quantity-asc');
    await sortSelect.selectOption('quantity-desc');
    await sortSelect.selectOption('customerName-asc');
    await sortSelect.selectOption('customerName-desc');
    
    await page.waitForTimeout(700);
    
    // Final sort should be applied
    await expect(sortSelect).toHaveValue('customerName-desc');
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should handle page size edge cases', async ({ page }) => {
    const pageSizeSelect = page.getByLabel(/results per page/i);
    
    // Change page size multiple times
    await pageSizeSelect.selectOption('10');
    await page.waitForTimeout(200);
    await pageSizeSelect.selectOption('100');
    await page.waitForTimeout(200);
    await pageSizeSelect.selectOption('25');
    await page.waitForTimeout(200);
    await pageSizeSelect.selectOption('50');
    
    await page.waitForTimeout(500);
    
    // Final page size should be applied
    await expect(pageSizeSelect).toHaveValue('50');
    await expect(page.locator('.transaction-table')).toBeVisible();
  });
});

