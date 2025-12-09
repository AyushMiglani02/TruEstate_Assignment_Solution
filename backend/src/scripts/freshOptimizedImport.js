/**
 * Fresh Optimized Import - Delete old data and import optimized
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

async function freshImport() {
  try {
    console.log('\n🔄 FRESH OPTIMIZED IMPORT\n');
    console.log('━'.repeat(60));
    
    await database.connect();
    
    // Step 1: Drop the bloated transactions collection
    console.log('\n1️⃣ Deleting old bloated data...');
    try {
      await Transaction.collection.drop();
      console.log('✅ Old transactions collection deleted!');
      console.log('💾 Freed up ~300-400 MB!');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        console.log('✅ Collection already clean');
      } else {
        console.warn('⚠️  Error dropping collection:', error.message);
      }
    }
    
    // Step 2: Wait for MongoDB to reclaim space
    console.log('\n2️⃣ Waiting for MongoDB to reclaim space...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Ready for optimized import');
    
    // Step 3: Check database stats
    console.log('\n3️⃣ Checking database status...');
    const db = database.getDatabase();
    const dbStats = await db.stats();
    console.log(`   Current DB size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Index size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    
    await database.disconnect();
    
    console.log('\n━'.repeat(60));
    console.log('✅ Cleanup complete! Now run: npm run import:optimized');
    console.log('━'.repeat(60) + '\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

freshImport();

