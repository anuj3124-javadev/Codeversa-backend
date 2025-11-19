const app = require('./app');
const config = require('./config/env');

// Use Render's PORT environment variable, fallback to config
const PORT = process.env.PORT || config.port || 5000;
// Bind to 0.0.0.0 for Render
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 CodeVerse Lite Backend Server Started');
  console.log(`📍 Host: ${HOST}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.env || process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log('📋 Available endpoints:');
  console.log(`   http://${HOST}:${PORT}/health`);
  console.log(`   http://${HOST}:${PORT}/api/auth`);
  console.log(`   http://${HOST}:${PORT}/api/run`);
  console.log('─────────────────────────────────────');
});

// Graceful shutdown for Render
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});