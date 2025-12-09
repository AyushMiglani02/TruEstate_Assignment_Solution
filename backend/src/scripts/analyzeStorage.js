/**
 * Analyze Storage Usage
 */

import dotenv from 'dotenv';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

async function analyze() {
  try {
    await database.connect();
    
    console.log('\n📊 STORAGE ANALYSIS\n');
    console.log('━'.repeat(60));
    
    // Get collection stats
    const db = database.getDatabase();
    const stats = await db.collection('transactions').stats();
    
    console.log('📈 Collection Statistics:');
    console.log(`   Documents: ${stats.count.toLocaleString()}`);
    console.log(`   Storage Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Document Size: ${stats.avgObjSize.toFixed(0)} bytes`);
    console.log(`   Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total Size: ${((stats.size + stats.totalIndexSize) / 1024 / 1024).toFixed(2)} MB`);
    
    // Sample document to see what's taking space
    console.log('\n📄 Sample Document Structure:');
    const sample = await Transaction.findOne().lean();
    console.log(`   Fields: ${Object.keys(sample).length}`);
    console.log(`   Actual size: ${JSON.stringify(sample).length} bytes`);
    
    // Estimate how many more we can fit
    const usedSpace = (stats.size + stats.totalIndexSize) / 1024 / 1024;
    const freeSpace = 512 - usedSpace;
    const avgDocSize = stats.avgObjSize * 1.5; // Including indexes
    const potentialDocs = Math.floor((freeSpace * 1024 * 1024) / avgDocSize);
    
    console.log('\n💾 Storage Capacity:');
    console.log(`   Used: ${usedSpace.toFixed(2)} MB / 512 MB`);
    console.log(`   Free: ${freeSpace.toFixed(2)} MB`);
    console.log(`   Can fit approximately: ${potentialDocs.toLocaleString()} more documents`);
    console.log(`   Estimated total capacity: ${(stats.count + potentialDocs).toLocaleString()} documents`);
    
    await database.disconnect();
    
    console.log('\n' + '━'.repeat(60));
    console.log('✅ Analysis complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

analyze();

