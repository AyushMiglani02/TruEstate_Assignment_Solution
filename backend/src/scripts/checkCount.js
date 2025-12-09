import database from '../config/database.js';
import Transaction from '../models/Transaction.js';

async function checkCount() {
  try {
    await database.connect();
    
    const count = await Transaction.countDocuments();
    console.log(`\n📊 Current records in database: ${count.toLocaleString()}`);
    
    const sample = await Transaction.findOne();
    if (sample) {
      console.log('📝 Sample transaction ID:', sample.transactionId);
      console.log('📅 Sample date:', sample.date);
      console.log('📦 Document fields:', Object.keys(sample._doc).join(', '));
    }
    
    await database.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCount();

