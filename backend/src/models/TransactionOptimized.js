/**
 * OPTIMIZED Transaction Model - Fits 500K+ records in 512MB
 * 
 * Changes from original:
 * 1. Removed unnecessary indexes (kept only critical ones)
 * 2. Removed unused fields (brand, orderStatus, deliveryType, etc.)
 * 3. Used sparse indexes where appropriate
 * 4. Optimized compound indexes
 */

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Core Identity (Required)
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Customer Fields (Only what's displayed in UI)
  customerId: {
    type: String,
    required: true,
    index: { sparse: true } // Sparse = don't index null values
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: String,
  gender: {
    type: String,
    index: true // Keep - used in filters
  },
  age: {
    type: Number,
    index: true // Keep - used in filters
  },
  customerRegion: {
    type: String,
    index: true // Keep - used in filters
  },

  // Product Fields (Only essentials)
  productId: String,
  productCategory: {
    type: String,
    index: true // Keep - used in filters
  },
  tags: [String], // No index - rarely filtered alone

  // Sales Fields (Core)
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    index: { sparse: true }
  },
  finalAmount: Number,

  // Operational Fields (Minimal)
  date: {
    type: Date,
    required: true,
    index: true // Keep - used for sorting
  },
  paymentMethod: {
    type: String,
    index: true // Keep - used in filters
  },
  employeeName: String
}, {
  timestamps: false, // Remove createdAt/updatedAt to save space
  collection: 'transactions',
  // Optimize storage
  autoIndex: false, // Build indexes manually after import
  minimize: true // Remove empty objects
});

// ONLY 3 CRITICAL COMPOUND INDEXES (vs 5+ before)
transactionSchema.index({ customerRegion: 1, gender: 1 });
transactionSchema.index({ date: -1, totalAmount: -1 });
transactionSchema.index({ productCategory: 1, date: -1 });

// Text index for search (optimized for common fields only)
transactionSchema.index({ 
  customerName: 'text', 
  phoneNumber: 'text'
});

// Virtual for discount (don't store it)
transactionSchema.virtual('discountAmount').get(function() {
  return this.totalAmount - (this.finalAmount || this.totalAmount);
});

// Static method for aggregate stats
transactionSchema.statics.getAggregateStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalUnits: { $sum: '$quantity' },
        totalAmount: { $sum: '$totalAmount' },
        totalDiscount: { $sum: { $subtract: ['$totalAmount', { $ifNull: ['$finalAmount', '$totalAmount'] }] } },
        recordCount: { $sum: 1 }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  
  if (result.length === 0) {
    return {
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0,
      recordCount: 0
    };
  }

  return result[0];
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
