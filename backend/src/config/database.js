/**
 * MongoDB Database Configuration and Connection
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected) {
      console.log('📊 Already connected to MongoDB');
      return;
    }

    try {
      const uri = process.env.MONGODB_URI;
      
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      console.log('🔄 Connecting to MongoDB...');
      
      // Connect with optimized options
      this.connection = await mongoose.connect(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB Atlas successfully!');
      
      if (mongoose.connection && mongoose.connection.db) {
        console.log(`📁 Database: ${mongoose.connection.db.databaseName}`);
      }
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
        this.isConnected = false;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('👋 Disconnected from MongoDB');
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Get database instance
   * @returns {mongoose.Connection}
   */
  getDatabase() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return mongoose.connection.db;
  }
}

// Export singleton instance
const database = new Database();
export default database;

