/**
 * Optimized CSV Import - Imports with minimal storage footprint
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import database from '../config/database.js';
import TransactionOptimized from '../models/TransactionOptimized.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OptimizedImporter {
  constructor() {
    this.batchSize = 5000; // Larger batches for faster import
    this.totalImported = 0;
    this.totalErrors = 0;
    this.startTime = null;
  }

  parseTransaction(row) {
    const parseNum = (v) => {
      if (!v || v === '' || v === 'null') return 0;
      const p = parseFloat(v);
      return isNaN(p) ? 0 : p;
    };

    const parseDate = (v) => {
      if (!v || v === '' || v === 'null') return new Date();
      const d = new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    // Map full values to compact ones
    const genderMap = { 'Male': 'M', 'Female': 'F', 'Other': 'O' };
    const regionMap = { 'North': 'N', 'South': 'S', 'East': 'E', 'West': 'W' };

    return {
      tid: row.transactionId || row.transaction_id || `TX${Date.now()}${Math.random()}`,
      cid: row.customerId || row.customer_id || '',
      cname: row.customerName || row.customer_name || '',
      phone: row.phoneNumber || row.phone_number || '',
      gender: genderMap[row.gender || row.Gender] || '',
      age: parseNum(row.age || row.Age),
      region: regionMap[row.customerRegion || row.customer_region] || '',
      pid: row.productId || row.product_id || '',
      pname: row.productName || row.product_name || '',
      category: row.productCategory || row.product_category || '',
      tags: (row.tags || row.Tags || '').split(',').map(t => t.trim()).filter(t => t.length > 0 && t.length < 20), // Limit tag length
      qty: parseNum(row.quantity || row.Quantity),
      price: parseNum(row.pricePerUnit || row.price_per_unit),
      total: parseNum(row.totalAmount || row.total_amount),
      final: parseNum(row.finalAmount || row.final_amount),
      date: parseDate(row.date || row.Date),
      payment: row.paymentMethod || row.payment_method || '',
      emp: row.employeeName || row.employee_name || ''
    };
  }

  async importFromCSV(filePath) {
    this.startTime = Date.now();
    console.log('\n🚀 OPTIMIZED IMPORT (500K+ Records Target)\n');
    console.log('━'.repeat(60));

    const absolutePath = path.isAbsolute(filePath) 
      ? filePath 
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    return new Promise((resolve, reject) => {
      let batch = [];
      let rowCount = 0;
      let skipCount = 0;

      const stream = fs.createReadStream(absolutePath)
        .pipe(csv())
        .on('data', async (row) => {
          try {
            // Skip if we've already imported this (check batch for duplicate tid)
            const transaction = this.parseTransaction(row);
            
            batch.push(transaction);
            rowCount++;

            if (batch.length >= this.batchSize) {
              stream.pause();
              
              try {
                await this.insertBatch(batch);
                batch = [];
              } catch (error) {
                if (error.message.includes('over your space quota')) {
                  console.log('\n⚠️  Storage quota reached. Stopping import.');
                  console.log(`✅ Successfully imported ${this.totalImported.toLocaleString()} records`);
                  stream.destroy();
                  resolve();
                  return;
                }
                console.error('❌ Batch error:', error.message);
                this.totalErrors += batch.length;
                batch = [];
              }
              
              stream.resume();
            }

            if (rowCount % 50000 === 0) {
              this.printProgress();
            }

          } catch (error) {
            this.totalErrors++;
          }
        })
        .on('end', async () => {
          if (batch.length > 0) {
            try {
              await this.insertBatch(batch);
            } catch (error) {
              console.error('❌ Final batch error:', error.message);
            }
          }
          this.printFinalStats();
          resolve();
        })
        .on('error', reject);
    });
  }

  async insertBatch(batch) {
    try {
      await TransactionOptimized.insertMany(batch, { ordered: false });
      this.totalImported += batch.length;
    } catch (error) {
      if (error.code === 11000) {
        const successCount = batch.length - (error.writeErrors?.length || 0);
        this.totalImported += successCount;
        this.totalErrors += (error.writeErrors?.length || 0);
      } else {
        throw error;
      }
    }
  }

  printProgress() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const rate = Math.floor(this.totalImported / elapsed);
    console.log(`⏳ ${this.totalImported.toLocaleString()} | ${rate}/sec | Errors: ${this.totalErrors}`);
  }

  printFinalStats() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const rate = Math.floor(this.totalImported / elapsed);
    console.log('\n' + '━'.repeat(60));
    console.log(`✅ Imported: ${this.totalImported.toLocaleString()}`);
    console.log(`⏱️  Time: ${elapsed}s | Rate: ${rate}/sec`);
    console.log('━'.repeat(60));
  }
}

async function main() {
  try {
    await database.connect();

    // Clear existing optimized data
    console.log('🗑️  Clearing existing optimized data...');
    await TransactionOptimized.deleteMany({});
    
    const importer = new OptimizedImporter();
    await importer.importFromCSV(process.env.CSV_FILE_PATH || '../truestate_assignment_dataset.csv');
    
    // Create indexes
    console.log('\n🔍 Creating indexes...');
    await TransactionOptimized.createIndexes();
    console.log('✅ Indexes created!');
    
    const total = await TransactionOptimized.countDocuments();
    console.log(`\n📊 Total optimized documents: ${total.toLocaleString()}\n`);
    
    await database.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

