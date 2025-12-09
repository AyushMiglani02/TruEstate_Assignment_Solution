/**
 * Check Database Statistics
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

async function checkStats() {
  try {
    await database.connect();
    
    console.log('\n📊 DATABASE STATISTICS\n');
    console.log('━'.repeat(60));
    
    // Count documents
    const count = await Transaction.countDocuments();
    console.log(`\n✅ Total Transactions: ${count.toLocaleString()}`);
    
    // Get storage stats
    const db = mongoose.connection.db;
    const stats = await db.command({ collStats: 'transactions' });
    
    console.log(`\n💾 Storage Information:`);
    console.log(`   📦 Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   🔍 Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📊 Total Size: ${((stats.storageSize + stats.totalIndexSize) / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📄 Avg Document Size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`   🎯 Documents: ${stats.count.toLocaleString()}`);
    
    // Check indexes
    const indexes = await Transaction.collection.indexes();
    console.log(`\n🔍 Indexes (${indexes.length}):`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}`);
    });
    
    await database.disconnect();
    console.log('\n' + '━'.repeat(60));
    console.log('✅ Stats check complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

checkStats();

