/**
 * Remove Duplicate Transactions
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

dotenv.config();

async function removeDuplicates() {
  try {
    await database.connect();
    
    console.log('\n🧹 REMOVING DUPLICATE TRANSACTIONS\n');
    console.log('━'.repeat(60));
    
    const beforeCount = await Transaction.countDocuments();
    console.log(`📊 Before: ${beforeCount.toLocaleString()} transactions`);
    
    console.log('\n🔄 Finding duplicates...');
    
    // Find duplicate transactionIds
    const duplicates = await Transaction.aggregate([
      {
        $group: {
          _id: '$transactionId',
          count: { $sum: 1 },
          ids: { $push: '$_id' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);
    
    console.log(`🔍 Found ${duplicates.length.toLocaleString()} duplicate transaction IDs`);
    
    if (duplicates.length > 0) {
      console.log('\n🗑️  Removing duplicates (keeping oldest)...');
      
      let deletedCount = 0;
      for (const dup of duplicates) {
        // Keep the first one, delete the rest
        const idsToDelete = dup.ids.slice(1);
        await Transaction.deleteMany({ _id: { $in: idsToDelete } });
        deletedCount += idsToDelete.length;
        
        if (deletedCount % 10000 === 0) {
          console.log(`   Deleted: ${deletedCount.toLocaleString()}...`);
        }
      }
      
      console.log(`✅ Deleted ${deletedCount.toLocaleString()} duplicates`);
    }
    
    const afterCount = await Transaction.countDocuments();
    console.log(`\n📊 After: ${afterCount.toLocaleString()} transactions`);
    console.log(`📉 Removed: ${(beforeCount - afterCount).toLocaleString()} duplicates`);
    
    // Get final stats
    const stats = await mongoose.connection.db.command({ collStats: 'transactions' });
    console.log(`\n💾 Final Storage: ${((stats.storageSize + stats.totalIndexSize) / 1024 / 1024).toFixed(2)} MB`);
    
    await database.disconnect();
    
    console.log('\n━'.repeat(60));
    console.log('🎉 Cleanup complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

removeDuplicates();

