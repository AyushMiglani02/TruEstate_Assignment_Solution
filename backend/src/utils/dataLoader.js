import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * DataLoader - Handles loading and caching of sales transaction data
 */
class DataLoader {
  constructor() {
    this.data = null;
    this.isLoaded = false;
  }

  /**
   * Loads CSV data and parses it into JSON format
   * @param {string} filePath - Path to the CSV file
   * @returns {Promise<Array>} Parsed transaction data
   */
  async loadData(filePath) {
    if (this.isLoaded && this.data) {
      return this.data;
    }

    return new Promise((resolve, reject) => {
      const results = [];
      const absolutePath = path.isAbsolute(filePath) 
        ? filePath 
        : path.resolve(process.cwd(), filePath);

      if (!fs.existsSync(absolutePath)) {
        reject(new Error(`File not found: ${absolutePath}`));
        return;
      }

      fs.createReadStream(absolutePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const transaction = this.parseTransaction(row);
            results.push(transaction);
          } catch (error) {
            console.warn('Error parsing row:', error.message);
          }
        })
        .on('end', () => {
          this.data = results;
          this.isLoaded = true;
          console.log(`✅ Loaded ${results.length} transactions from CSV`);
          resolve(results);
        })
        .on('error', (error) => {
          reject(new Error(`Error reading CSV file: ${error.message}`));
        });
    });
  }

  /**
   * Parses a CSV row into a structured transaction object
   * @param {Object} row - Raw CSV row
   * @returns {Object} Parsed transaction
   */
  parseTransaction(row) {
    return {
      // Customer Fields
      customerId: row.customerId || row.customer_id || row['Customer ID'] || '',
      customerName: row.customerName || row.customer_name || row['Customer Name'] || '',
      phoneNumber: row.phoneNumber || row.phone_number || row['Phone Number'] || '',
      gender: row.gender || row.Gender || '',
      age: this.parseNumber(row.age || row.Age),
      customerRegion: row.customerRegion || row.customer_region || row['Customer Region'] || '',
      customerType: row.customerType || row.customer_type || row['Customer Type'] || '',

      // Product Fields
      productId: row.productId || row.product_id || row['Product ID'] || '',
      productName: row.productName || row.product_name || row['Product Name'] || '',
      brand: row.brand || row.Brand || '',
      productCategory: row.productCategory || row.product_category || row['Product Category'] || '',
      tags: this.parseTags(row.tags || row.Tags),

      // Sales Fields
      quantity: this.parseNumber(row.quantity || row.Quantity),
      pricePerUnit: this.parseNumber(row.pricePerUnit || row.price_per_unit || row['Price per Unit']),
      discountPercentage: this.parseNumber(row.discountPercentage || row.discount_percentage || row['Discount Percentage']),
      totalAmount: this.parseNumber(row.totalAmount || row.total_amount || row['Total Amount']),
      finalAmount: this.parseNumber(row.finalAmount || row.final_amount || row['Final Amount']),

      // Operational Fields
      date: this.parseDate(row.date || row.Date),
      paymentMethod: row.paymentMethod || row.payment_method || row['Payment Method'] || '',
      orderStatus: row.orderStatus || row.order_status || row['Order Status'] || '',
      deliveryType: row.deliveryType || row.delivery_type || row['Delivery Type'] || '',
      storeId: row.storeId || row.store_id || row['Store ID'] || '',
      storeLocation: row.storeLocation || row.store_location || row['Store Location'] || '',
      salespersonId: row.salespersonId || row.salesperson_id || row['Salesperson ID'] || '',
      employeeName: row.employeeName || row.employee_name || row['Employee Name'] || ''
    };
  }

  /**
   * Safely parses a number value
   * @param {*} value - Value to parse
   * @returns {number} Parsed number or 0
   */
  parseNumber(value) {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Parses tags from string or array format
   * @param {string|Array} value - Tags value
   * @returns {Array<string>} Array of tags
   */
  parseTags(value) {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    return [];
  }

  /**
   * Parses date string into ISO format
   * @param {string} value - Date string
   * @returns {string} ISO date string
   */
  parseDate(value) {
    if (!value) return new Date().toISOString();
    
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  /**
   * Gets cached data
   * @returns {Array|null} Cached data or null
   */
  getData() {
    return this.data;
  }

  /**
   * Clears cached data
   */
  clearCache() {
    this.data = null;
    this.isLoaded = false;
  }
}

// Export singleton instance
const dataLoader = new DataLoader();
export default dataLoader;

