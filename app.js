const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models');
const config = require('./config/env');

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
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'CodeVerse Backend',
      database: 'connected',
      environment: config.env,
      ai_service: config.ai.service
    });
  } catch (error) {
    res.status(200).json({ 
      status: 'DEGRADED', 
      timestamp: new Date().toISOString(),
      service: 'CodeVerse Backend', 
      database: 'disconnected',
      environment: config.env,
      message: 'Database connection failed but API is running'
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/run', require('./routes/run'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/snippets', require('./routes/snippets'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Test endpoint for run route
app.get('/api/run/test', (req, res) => {
  res.json({ 
    message: 'Run route is working!',
    database: config.db.host,
    ai_service: config.ai.service
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CodeVerse Lite Backend API',
    version: '1.0.0',
    environment: config.env,
    database: `${config.db.host}:${config.db.port}`,
    ai_service: config.ai.service,
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

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: config.env === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;