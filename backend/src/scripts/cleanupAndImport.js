/**
 * Cleanup Script - Delete oplog.rs and import remaining transactions
 */

import dotenv from 'dotenv';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';
import DataImporter from './importData.js';

dotenv.config();

async function cleanup() {
  try {
    console.log('\n🧹 CLEANUP & IMPORT SCRIPT\n');
    console.log('━'.repeat(60));
    
    // Connect to MongoDB
    await database.connect();
    
    // 1. Drop the oplog collection (frees up ~400MB)
    console.log('\n1️⃣ Checking for oplog.rs collection...');
    try {
      const db = database.getDatabase();
      const collections = await db.listCollections({ name: 'oplog.rs' }).toArray();
      
      if (collections.length > 0) {
        console.log('🗑️  Found oplog.rs - deleting to free up space...');
        await db.collection('oplog.rs').drop();
        console.log('✅ oplog.rs deleted successfully!');
        console.log('💾 Freed up ~400-450 MB of storage!');
      } else {
        console.log('✅ oplog.rs not found (already clean)');
      }
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('✅ oplog.rs not found (already clean)');
      } else {
        console.warn('⚠️  Could not delete oplog.rs:', error.message);
      }
    }
    
    // 2. Check current transaction count
    console.log('\n2️⃣ Checking current data...');
    const currentCount = await Transaction.countDocuments();
    console.log(`📊 Current transactions in database: ${currentCount.toLocaleString()}`);
    
    // 3. Import remaining transactions
    console.log('\n3️⃣ Importing remaining transactions...');
    const importer = new DataImporter();
    const csvPath = process.env.CSV_FILE_PATH || '../truestate_assignment_dataset.csv';
    
    await importer.importFromCSV(csvPath);
    
    // 4. Create/update indexes
    await importer.createIndexes();
    
    // 5. Final verification
    console.log('\n4️⃣ Final verification...');
    const finalCount = await Transaction.countDocuments();
    console.log(`✅ Total transactions now: ${finalCount.toLocaleString()}`);
    console.log(`📈 Added: ${(finalCount - currentCount).toLocaleString()} new records`);
    
    // Disconnect
    await database.disconnect();
    
    console.log('\n' + '━'.repeat(60));
    console.log('🎉 Cleanup and import completed successfully!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

cleanup();

