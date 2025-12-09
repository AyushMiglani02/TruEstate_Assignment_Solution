/**
 * Test MongoDB Connection and Check Data
 */

import dotenv from 'dotenv';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

async function test() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await database.connect();
    
    console.log('\n📊 Checking database...');
    const count = await Transaction.countDocuments();
    console.log(`✅ Total transactions in database: ${count.toLocaleString()}`);
    
    if (count > 0) {
      console.log('\n📄 Sample document:');
      const sample = await Transaction.findOne();
      console.log(JSON.stringify(sample, null, 2));
    }
    
    await database.disconnect();
    console.log('\n✅ Test complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

test();

