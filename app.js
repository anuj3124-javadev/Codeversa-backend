const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');

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
    'https://your-frontend-app.onrender.com'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check with database status
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'CodeVerse Backend',
      database: 'connected',
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    // Database is down but server is running
    res.status(200).json({ 
      status: 'DEGRADED', 
      timestamp: new Date().toISOString(),
      service: 'CodeVerse Backend', 
      database: 'disconnected',
      environment: process.env.NODE_ENV || 'production',
      message: 'Database connection failed but API is running'
    });
  }
});

// Routes (they should handle database errors internally)
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
    status: 'running',
    environment: process.env.NODE_ENV || 'production',
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
  console.error('❌ Error:', err.message);
  
  // Database connection errors
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Database connection failed'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      message: err.message
    })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = app;