/**
 * Optimize Schema and Reimport Script
 * 
 * 1. Drops existing collection
 * 2. Imports with optimized schema (no timestamps, fewer indexes)
 * 3. Builds only critical indexes after import
 * 4. Should fit 500K+ records in 512MB
 */

import dotenv from 'dotenv';
import database from '../config/database.js';
import DataImporter from './importData.js';
import mongoose from 'mongoose';

dotenv.config();

async function optimizeAndReimport() {
  try {
    console.log('\n🔧 OPTIMIZE SCHEMA & REIMPORT\n');
    console.log('━'.repeat(60));
    
    await database.connect();
    
    // Step 1: Drop existing collection to start fresh
    console.log('\n1️⃣ Dropping existing collection...');
    try {
      await mongoose.connection.db.collection('transactions').drop();
      console.log('✅ Old collection dropped');
    } catch (error) {
      console.log('⚠️  No existing collection to drop');
    }
    
    // Step 2: Import with new optimized schema
    console.log('\n2️⃣ Importing with optimized schema (no indexes yet)...');
    console.log('💡 This will be faster and use less space!');
    
    // Temporarily disable auto-indexing
    mongoose.set('autoIndex', false);
    
    const importer = new DataImporter();
    const csvPath = process.env.CSV_FILE_PATH || '../truestate_assignment_dataset.csv';
    
    await importer.importFromCSV(csvPath);
    
    // Step 3: Build only critical indexes
    console.log('\n3️⃣ Building optimized indexes...');
    console.log('📌 Creating only essential indexes...');
    
    const collection = mongoose.connection.db.collection('transactions');
    
    // Critical indexes only
    await collection.createIndex({ transactionId: 1 }, { unique: true });
    await collection.createIndex({ customerRegion: 1 });
    await collection.createIndex({ gender: 1 });
    await collection.createIndex({ age: 1 });
    await collection.createIndex({ productCategory: 1 });
    await collection.createIndex({ date: -1 });
    await collection.createIndex({ paymentMethod: 1 });
    
    // Compound indexes for performance
    await collection.createIndex({ customerRegion: 1, gender: 1 });
    await collection.createIndex({ date: -1, totalAmount: -1 });
    await collection.createIndex({ productCategory: 1, date: -1 });
    
    // Text index for search
    await collection.createIndex({ 
      customerName: 'text', 
      phoneNumber: 'text' 
    });
    
    console.log('✅ Indexes created successfully!');
    
    // Step 4: Verify
    console.log('\n4️⃣ Verification...');
    const finalCount = await collection.countDocuments();
    const stats = await collection.stats();
    
    console.log(`✅ Total documents: ${finalCount.toLocaleString()}`);
    console.log(`💾 Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📊 Index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`🎯 Total size: ${((stats.storageSize + stats.totalIndexSize) / 1024 / 1024).toFixed(2)} MB`);
    
    await database.disconnect();
    
    console.log('\n' + '━'.repeat(60));
    console.log('🎉 Optimization complete!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Optimization failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

optimizeAndReimport();

