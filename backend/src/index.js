import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import database from './config/database.js';
import { errorMiddleware, notFoundHandler } from './middleware/errorMiddleware.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration for production
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Enable CORS with configuration
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorMiddleware);

// Server initialization
const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log('📊 Connecting to MongoDB...');
    await database.connect();
    console.log('✅ MongoDB ready!');
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API root: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('\n⏳ Shutting down gracefully...');
      await database.disconnect();
      server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export for testing
export { app, startServer };

