const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const path = require('path');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000', 
    'https://codeversa-frontend.vercel.app',
    'https://your-frontend-app.onrender.com' // Add your actual frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check - should be first
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CodeVerse Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for run route
app.get('/api/run/test', (req, res) => {
  res.json({ message: 'Run route is working!' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/run', require('./routes/run'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/snippets', require('./routes/snippets'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CodeVerse Lite Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      run: '/api/run', 
      ai: '/api/ai',
      snippets: '/api/snippets',
      contact: '/api/contact',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message,
      stack: err.stack 
    })
  });
});

// 404 handler - MUST be last
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/api/auth',
      '/api/run',
      '/api/ai', 
      '/api/snippets',
      '/api/contact',
      '/api/admin',
      '/health'
    ]
  });
});

// Database connection test
const testDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database in development only
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced successfully.');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit process in production, let the health check handle it
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
};

testDBConnection();

module.exports = app;