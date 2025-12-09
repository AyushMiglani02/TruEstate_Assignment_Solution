/**
 * CSV Data Import Script - Imports transactions from CSV to MongoDB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DataImporter {
  constructor() {
    this.batchSize = 1000; // Insert in batches for performance
    this.totalImported = 0;
    this.totalErrors = 0;
    this.startTime = null;
  }

  /**
   * Parse CSV row into transaction object
   * @param {Object} row - Raw CSV row
   * @returns {Object} Parsed transaction
   */
  parseTransaction(row) {
    // Helper to parse numbers
    const parseNumber = (value) => {
      if (!value || value === '' || value === 'null' || value === 'NULL') return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper to parse date
    const parseDate = (value) => {
      if (!value || value === '' || value === 'null') return new Date();
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    };

    // Helper to parse tags
    const parseTags = (value) => {
      if (!value || value === '' || value === 'null') return [];
      return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    };

    // OPTIMIZED: Only include fields displayed in UI or used in filters
    return {
      transactionId: row.transactionId || row.transaction_id || row['Transaction ID'] || `TX${Date.now()}${Math.random()}`,
      
      // Customer Fields (UI displayed)
      customerId: row.customerId || row.customer_id || row['Customer ID'] || '',
      customerName: row.customerName || row.customer_name || row['Customer Name'] || '',
      phoneNumber: row.phoneNumber || row.phone_number || row['Phone Number'] || '',
      gender: row.gender || row.Gender || '',
      age: parseNumber(row.age || row.Age),
      customerRegion: row.customerRegion || row.customer_region || row['Customer Region'] || '',

      // Product Fields (UI displayed)
      productId: row.productId || row.product_id || row['Product ID'] || '',
      productCategory: row.productCategory || row.product_category || row['Product Category'] || '',
      tags: parseTags(row.tags || row.Tags || ''),

      // Sales Fields (Required for calculations)
      quantity: parseNumber(row.quantity || row.Quantity),
      totalAmount: parseNumber(row.totalAmount || row.total_amount || row['Total Amount']),
      finalAmount: parseNumber(row.finalAmount || row.final_amount || row['Final Amount']),

      // Operational Fields (UI displayed)
      date: parseDate(row.date || row.Date),
      paymentMethod: row.paymentMethod || row.payment_method || row['Payment Method'] || '',
      employeeName: row.employeeName || row.employee_name || row['Employee Name'] || ''
      
      // REMOVED: brand, customerType, productName, pricePerUnit, discountPercentage,
      //          orderStatus, deliveryType, storeId, storeLocation, salespersonId
      // These fields save ~40% storage space!
    };
  }

  /**
   * Import data from CSV file
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<void>}
   */
  async importFromCSV(filePath) {
    this.startTime = Date.now();
    
    console.log('\n🚀 Starting MongoDB Import Process...');
    console.log('📂 File:', filePath);
    console.log('📊 Batch Size:', this.batchSize);
    console.log('━'.repeat(50));

    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    return new Promise((resolve, reject) => {
      let batch = [];
      let rowCount = 0;

      const stream = fs.createReadStream(absolutePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            const transaction = this.parseTransaction(row);
            batch.push(transaction);
            rowCount++;

            // Insert batch when it reaches the batch size
            if (batch.length >= this.batchSize) {
              stream.pause(); // Pause reading while inserting
              
              try {
                await this.insertBatch(batch);
                batch = []; // Clear batch
              } catch (error) {
                console.error('❌ Batch insert error:', error.message);
                this.totalErrors += batch.length;
                batch = [];
              }
              
              stream.resume(); // Resume reading
            }

            // Progress indicator every 10000 rows
            if (rowCount % 10000 === 0) {
              this.printProgress();
            }

          } catch (error) {
            console.warn('⚠️  Error parsing row:', error.message);
            this.totalErrors++;
          }
        })
        .on('end', async () => {
          // Insert remaining batch
          if (batch.length > 0) {
            try {
              await this.insertBatch(batch);
            } catch (error) {
              console.error('❌ Final batch insert error:', error.message);
              this.totalErrors += batch.length;
            }
          }

          this.printFinalStats();
          resolve();
        })
        .on('error', (error) => {
          console.error('❌ Stream error:', error);
          reject(error);
        });
    });
  }

  /**
   * Insert a batch of transactions
   * @param {Array} batch - Array of transaction objects
   * @returns {Promise<void>}
   */
  async insertBatch(batch) {
    try {
      await Transaction.insertMany(batch, { ordered: false });
      this.totalImported += batch.length;
    } catch (error) {
      // Handle duplicate key errors (already imported data)
      if (error.code === 11000) {
        const successCount = batch.length - (error.writeErrors?.length || 0);
        this.totalImported += successCount;
        this.totalErrors += (error.writeErrors?.length || 0);
      } else {
        throw error;
      }
    }
  }

  /**
   * Print progress update
   */
  printProgress() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = Math.floor(this.totalImported / elapsed);
    console.log(`⏳ Imported: ${this.totalImported.toLocaleString()} | Rate: ${rate}/sec | Errors: ${this.totalErrors}`);
  }

  /**
   * Print final statistics
   */
  printFinalStats() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const rate = Math.floor(this.totalImported / elapsed);
    
    console.log('\n' + '━'.repeat(50));
    console.log('✅ Import Complete!');
    console.log('━'.repeat(50));
    console.log(`📊 Total Imported: ${this.totalImported.toLocaleString()}`);
    console.log(`❌ Total Errors: ${this.totalErrors.toLocaleString()}`);
    console.log(`⏱️  Total Time: ${elapsed}s`);
    console.log(`⚡ Average Rate: ${rate} records/sec`);
    console.log('━'.repeat(50) + '\n');
  }

  /**
   * Create indexes after import
   * @returns {Promise<void>}
   */
  async createIndexes() {
    console.log('\n🔍 Creating database indexes...');
    try {
      await Transaction.createIndexes();
      console.log('✅ All indexes created successfully!');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  }

  /**
   * Clear existing data (optional)
   * @returns {Promise<void>}
   */
  async clearExistingData() {
    console.log('\n🗑️  Clearing existing data...');
    const count = await Transaction.countDocuments();
    if (count > 0) {
      await Transaction.deleteMany({});
      console.log(`✅ Deleted ${count.toLocaleString()} existing records`);
    } else {
      console.log('✅ No existing data to clear');
    }
  }
}

/**
 * Main import function
 */
async function main() {
  try {
    // Connect to MongoDB
    await database.connect();

    const importer = new DataImporter();
    
    // Get CSV file path from environment or command line
    const csvPath = process.env.CSV_FILE_PATH || '../truestate_assignment_dataset.csv';
    
    // Ask user if they want to clear existing data
    const clearData = process.argv.includes('--clear');
    
    if (clearData) {
      await importer.clearExistingData();
    }

    // Import data
    await importer.importFromCSV(csvPath);

    // Create indexes
    await importer.createIndexes();

    // Verify import
    const totalCount = await Transaction.countDocuments();
    console.log(`\n📊 Total documents in database: ${totalCount.toLocaleString()}\n`);

    // Disconnect
    await database.disconnect();
    
    console.log('🎉 MongoDB import completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use as module
export default DataImporter;

// Always run main if this file is executed directly
main();

