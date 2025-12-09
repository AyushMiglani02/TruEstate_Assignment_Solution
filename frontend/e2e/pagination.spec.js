import { test, expect } from '@playwright/test';

/**
 * E2E Test: Pagination Workflow
 * Tests the complete pagination functionality including:
 * - Page navigation
 * - Page size changes
 * - Page indicators
 * - Button states
 */

test.describe('Pagination Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
    
    // Wait for initial data load
    await page.waitForTimeout(1000);
  });

  test('should display pagination controls', async ({ page }) => {
    await expect(page.getByRole('navigation', { name: /pagination/i })).toBeVisible();
    await expect(page.getByLabel(/go to previous page/i)).toBeVisible();
    await expect(page.getByLabel(/go to next page/i)).toBeVisible();
    await expect(page.getByLabel(/results per page/i)).toBeVisible();
  });

  test('should show current page information', async ({ page }) => {
    const pageInfo = page.locator('.page-indicator');
    await expect(pageInfo).toBeVisible();
    await expect(pageInfo).toContainText(/page/i);
  });

  test('should show item count', async ({ page }) => {
    const itemCount = page.locator('.pagination-info');
    await expect(itemCount).toBeVisible();
    await expect(itemCount).toContainText(/showing/i);
  });

  test('should disable Previous button on first page', async ({ page }) => {
    const previousButton = page.getByLabel(/go to previous page/i);
    await expect(previousButton).toBeDisabled();
  });

  test('should navigate to next page', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    // If next button is enabled, click it
    if (await nextButton.isEnabled()) {
      // Get initial page number
      const pageInfo = page.locator('.page-indicator');
      const initialText = await pageInfo.textContent();
      
      // Click next
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Page number should have changed
      const newText = await pageInfo.textContent();
      expect(newText).not.toBe(initialText);
      
      // Previous button should now be enabled
      const previousButton = page.getByLabel(/go to previous page/i);
      await expect(previousButton).toBeEnabled();
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    if (await nextButton.isEnabled()) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Go back to page 1
      const previousButton = page.getByLabel(/go to previous page/i);
      await previousButton.click();
      await page.waitForTimeout(500);
      
      // Should be back on page 1
      const pageInfo = page.locator('.page-indicator');
      await expect(pageInfo).toContainText(/page.*1/i);
      
      // Previous button should be disabled
      await expect(previousButton).toBeDisabled();
    }
  });

  test('should change page size', async ({ page }) => {
    const pageSizeSelect = page.getByLabel(/results per page/i);
    
    // Change to 25 per page
    await pageSizeSelect.selectOption('25');
    await page.waitForTimeout(500);
    
    // Should be on page 1
    const pageInfo = page.locator('.page-indicator');
    await expect(pageInfo).toContainText(/page.*1/i);
    
    // Item count should reflect new page size
    const itemCount = page.locator('.pagination-info');
    const text = await itemCount.textContent();
    
    // Should show "to 25" or similar
    expect(text).toMatch(/to\s+(25|less)/i);
  });

  test('should reset to page 1 when changing page size', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    if (await nextButton.isEnabled()) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Change page size
      const pageSizeSelect = page.getByLabel(/results per page/i);
      await pageSizeSelect.selectOption('50');
      await page.waitForTimeout(500);
      
      // Should be back on page 1
      const pageInfo = page.locator('.page-indicator');
      await expect(pageInfo).toContainText(/page.*1/i);
    }
  });

  test('should show correct item range', async ({ page }) => {
    const itemCount = page.locator('.pagination-info');
    const text = await itemCount.textContent();
    
    // Should show something like "Showing 1 to 10 of X"
    expect(text).toMatch(/showing\s+\d+\s+to\s+\d+/i);
  });

  test('should display total page count', async ({ page }) => {
    const pageInfo = page.locator('.page-indicator');
    const text = await pageInfo.textContent();
    
    // Should show "Page X of Y"
    expect(text).toMatch(/page\s+\d+\s+of\s+\d+/i);
  });

  test('should disable Next button on last page', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    // Navigate to last page by repeatedly clicking next
    let attempts = 0;
    const maxAttempts = 100;
    
    while (await nextButton.isEnabled() && attempts < maxAttempts) {
      await nextButton.click();
      await page.waitForTimeout(300);
      attempts++;
    }
    
    // Next button should be disabled
    await expect(nextButton).toBeDisabled();
  });

  test('should update table content on page change', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    if (await nextButton.isEnabled()) {
      // Get first transaction ID from page 1
      const firstId1 = await page.locator('tbody tr:first-child td:first-child').textContent();
      
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Get first transaction ID from page 2
      const firstId2 = await page.locator('tbody tr:first-child td:first-child').textContent();
      
      // IDs should be different
      expect(firstId1).not.toBe(firstId2);
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    const nextButton = page.getByLabel(/go to next page/i);
    
    if (await nextButton.isEnabled()) {
      // Focus and press Enter
      await nextButton.focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Should have navigated
      const previousButton = page.getByLabel(/go to previous page/i);
      await expect(previousButton).toBeEnabled();
    }
  });

  test('should work with search', async ({ page }) => {
    const searchInput = page.getByLabel(/search transactions/i);
    
    // Search for something
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // Pagination should still work
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Search should still be active
      await expect(searchInput).toHaveValue('John');
    }
  });

  test('should work with filters', async ({ page }) => {
    // Apply filter
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Pagination should still work
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Filter should still be active
      await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    }
  });

  test('should work with sorting', async ({ page }) => {
    // Change sort
    const sortSelect = page.getByLabel(/sort transactions/i);
    await sortSelect.selectOption('quantity-desc');
    await page.waitForTimeout(500);
    
    // Navigate pages
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Sort should still be active
      await expect(sortSelect).toHaveValue('quantity-desc');
    }
  });

  test('should maintain page size across navigation', async ({ page }) => {
    const pageSizeSelect = page.getByLabel(/results per page/i);
    
    // Set page size to 25
    await pageSizeSelect.selectOption('25');
    await page.waitForTimeout(500);
    
    // Navigate if possible
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Page size should still be 25
      await expect(pageSizeSelect).toHaveValue('25');
    }
  });
});

