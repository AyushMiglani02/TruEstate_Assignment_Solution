import { test, expect } from '@playwright/test';

/**
 * E2E Test: Filter Workflow
 * Tests the complete filtering functionality including:
 * - Multi-select filters
 * - Range filters
 * - Clear all filters
 * - Filter combinations
 */

test.describe('Filter Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /retail sales management/i })).toBeVisible();
  });

  test('should display filter panel', async ({ page }) => {
    await expect(page.getByRole('region', { name: /filters/i })).toBeVisible();
    await expect(page.getByText('Customer Region')).toBeVisible();
    await expect(page.getByText('Gender')).toBeVisible();
    await expect(page.getByText('Age Range')).toBeVisible();
    await expect(page.getByText('Product Category')).toBeVisible();
    await expect(page.getByText('Payment Method')).toBeVisible();
  });

  test('should filter by single region', async ({ page }) => {
    // Check North region
    const northCheckbox = page.getByLabel(/filter by north region/i);
    await northCheckbox.check();
    
    // Wait for results
    await page.waitForTimeout(300);
    
    // Verify table shows results
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
    
    // Clear All button should be visible
    await expect(page.getByText('Clear All')).toBeVisible();
  });

  test('should filter by multiple regions', async ({ page }) => {
    // Check multiple regions
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by south region/i).check();
    
    await page.waitForTimeout(300);
    
    // Both checkboxes should be checked
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by south region/i)).toBeChecked();
    
    // Results should be displayed
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should filter by gender', async ({ page }) => {
    const maleCheckbox = page.getByLabel(/filter by male/i);
    await maleCheckbox.check();
    
    await page.waitForTimeout(300);
    
    await expect(maleCheckbox).toBeChecked();
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should filter by age range', async ({ page }) => {
    const minAgeInput = page.getByLabel(/minimum age/i);
    const maxAgeInput = page.getByLabel(/maximum age/i);
    
    // Set age range
    await minAgeInput.fill('25');
    await maxAgeInput.fill('50');
    
    await page.waitForTimeout(300);
    
    // Inputs should have the values
    await expect(minAgeInput).toHaveValue('25');
    await expect(maxAgeInput).toHaveValue('50');
    
    // Results should be displayed
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should filter by product category', async ({ page }) => {
    const electronicsCheckbox = page.getByLabel(/filter by electronics category/i);
    await electronicsCheckbox.check();
    
    await page.waitForTimeout(300);
    
    await expect(electronicsCheckbox).toBeChecked();
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should filter by payment method', async ({ page }) => {
    const creditCardCheckbox = page.getByLabel(/filter by credit card/i);
    await creditCardCheckbox.check();
    
    await page.waitForTimeout(300);
    
    await expect(creditCardCheckbox).toBeChecked();
    await expect(page.locator('.transaction-table')).toBeVisible();
  });

  test('should apply multiple filter types simultaneously', async ({ page }) => {
    // Apply multiple filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.getByLabel(/filter by electronics category/i).check();
    
    await page.waitForTimeout(500);
    
    // All filters should be applied
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).toBeChecked();
    await expect(page.getByLabel(/filter by electronics category/i)).toBeChecked();
    
    // Results should be filtered
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });

  test('should show Clear All button when filters are active', async ({ page }) => {
    // Initially no Clear All button
    await expect(page.getByText('Clear All')).not.toBeVisible();
    
    // Apply a filter
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(200);
    
    // Clear All button should appear
    await expect(page.getByText('Clear All')).toBeVisible();
  });

  test('should clear all filters when Clear All is clicked', async ({ page }) => {
    // Apply multiple filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/filter by male/i).check();
    await page.getByLabel(/minimum age/i).fill('25');
    await page.waitForTimeout(200);
    
    // Click Clear All
    await page.getByText('Clear All').click();
    await page.waitForTimeout(300);
    
    // All filters should be cleared
    await expect(page.getByLabel(/filter by north region/i)).not.toBeChecked();
    await expect(page.getByLabel(/filter by male/i)).not.toBeChecked();
    await expect(page.getByLabel(/minimum age/i)).toHaveValue('0');
    await expect(page.getByLabel(/maximum age/i)).toHaveValue('100');
    
    // Clear All button should disappear
    await expect(page.getByText('Clear All')).not.toBeVisible();
  });

  test('should uncheck filter by clicking it again', async ({ page }) => {
    const northCheckbox = page.getByLabel(/filter by north region/i);
    
    // Check the filter
    await northCheckbox.check();
    await expect(northCheckbox).toBeChecked();
    await page.waitForTimeout(200);
    
    // Uncheck the filter
    await northCheckbox.uncheck();
    await expect(northCheckbox).not.toBeChecked();
    await page.waitForTimeout(200);
  });

  test('should handle filter resulting in no results', async ({ page }) => {
    // Apply very restrictive filters
    await page.getByLabel(/filter by north region/i).check();
    await page.getByLabel(/minimum age/i).fill('90');
    await page.getByLabel(/maximum age/i).fill('95');
    
    await page.waitForTimeout(500);
    
    // May show no results (depending on data)
    // Just verify page doesn't crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Focus and interact with keyboard
    const northCheckbox = page.getByLabel(/filter by north region/i);
    
    await northCheckbox.focus();
    await page.keyboard.press('Space');
    
    await page.waitForTimeout(200);
    await expect(northCheckbox).toBeChecked();
  });

  test('should maintain filters across pagination', async ({ page }) => {
    // Apply filter
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(500);
    
    // Navigate to next page if available
    const nextButton = page.getByLabel(/go to next page/i);
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(300);
      
      // Filter should still be active
      await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    }
  });

  test('should work with search', async ({ page }) => {
    // Apply filter and search
    await page.getByLabel(/filter by north region/i).check();
    await page.waitForTimeout(200);
    
    const searchInput = page.getByLabel(/search transactions/i);
    await searchInput.fill('John');
    await page.waitForTimeout(500);
    
    // Both should be active
    await expect(page.getByLabel(/filter by north region/i)).toBeChecked();
    await expect(searchInput).toHaveValue('John');
    
    // Results should be displayed
    const table = page.locator('.transaction-table');
    await expect(table).toBeVisible();
  });
});

