/**
 * Transaction Model - MongoDB Schema for Sales Transactions
 */

/**
 * OPTIMIZED Transaction Model - Removed unused fields to fit 500K+ records
 */
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Transaction Identity
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Customer Fields
  customerId: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    index: true
  },
  phoneNumber: {
    type: String,
    index: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    index: true
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
    index: true
  },
  customerRegion: {
    type: String,
    index: true
  },

  // Product Fields (OPTIMIZED - removed unused)
  productId: String,
  productCategory: {
    type: String,
    index: true
  },
  tags: [String],

  // Sales Fields (OPTIMIZED - kept only essentials)
  quantity: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  finalAmount: Number,

  // Operational Fields (OPTIMIZED)
  date: {
    type: Date,
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    index: true
  },
  employeeName: String
}, {
  timestamps: false, // OPTIMIZED: Remove to save space (~10%)
  collection: 'transactions',
  minimize: true // Remove empty objects
});

// OPTIMIZED: Only 3 critical compound indexes (vs 5+ before)
transactionSchema.index({ customerRegion: 1, gender: 1 });
transactionSchema.index({ date: -1, totalAmount: -1 });
transactionSchema.index({ productCategory: 1, date: -1 });

// OPTIMIZED: Text index on fewer fields
transactionSchema.index({ 
  customerName: 'text', 
  phoneNumber: 'text'
});

// Virtual for discount amount
transactionSchema.virtual('discountAmount').get(function() {
  return this.totalAmount - this.finalAmount;
});

// Instance method to get formatted date
transactionSchema.methods.getFormattedDate = function() {
  return this.date.toISOString().split('T')[0];
};

// Static method to get aggregated stats
transactionSchema.statics.getAggregateStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalUnits: { $sum: '$quantity' },
        totalAmount: { $sum: '$totalAmount' },
        totalDiscount: { $sum: { $subtract: ['$totalAmount', '$finalAmount'] } },
        recordCount: { $sum: 1 },
        avgOrderValue: { $avg: '$finalAmount' },
        minOrderValue: { $min: '$finalAmount' },
        maxOrderValue: { $max: '$finalAmount' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  
  if (result.length === 0) {
    return {
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0,
      recordCount: 0,
      avgOrderValue: 0,
      minOrderValue: 0,
      maxOrderValue: 0
    };
  }

  return result[0];
};

// Export the model
const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

