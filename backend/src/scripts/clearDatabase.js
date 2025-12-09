import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...\n');
    
    // Connect to MongoDB
    await database.connect();
    
    // Count existing documents
    const existingCount = await Transaction.countDocuments();
    console.log(`📊 Found ${existingCount.toLocaleString()} existing documents`);
    
    if (existingCount > 0) {
      console.log('🧹 Dropping entire collection (fastest method)...');
      
      // Drop the entire collection - much faster than deleteMany
      await Transaction.collection.drop();
      console.log(`✅ Collection dropped successfully!`);
      
      // Recreate indexes after dropping
      console.log('🔨 Recreating indexes...');
      await Transaction.createIndexes();
      console.log('✅ Indexes recreated!');
    } else {
      console.log('✅ Database is already empty');
    }
    
    // Verify deletion
    const remainingCount = await Transaction.countDocuments();
    console.log(`\n📊 Final count: ${remainingCount} documents`);
    
    if (remainingCount === 0) {
      console.log('✅ Database successfully cleared!');
    } else {
      console.log('⚠️  Warning: Some documents may remain');
    }
    
    await database.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    
  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log('✅ Collection does not exist (already clean)');
      await database.disconnect();
    } else {
      console.error('❌ Error clearing database:', error.message);
      process.exit(1);
    }
  }
}

clearDatabase();

