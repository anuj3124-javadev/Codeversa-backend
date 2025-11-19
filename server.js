const app = require('./app');
const config = require('./config/env');

const PORT = process.env.PORT || config.port;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log('🚀 CodeVerse Lite Backend Server Started');
  console.log(`📍 Host: ${HOST}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`📊 Database: ${config.db.host}:${config.db.port}`);
  console.log(`🤖 AI Service: ${config.ai.service}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log('📋 Available endpoints:');
  console.log(`   http://${HOST}:${PORT}/health`);
  console.log(`   http://${HOST}:${PORT}/api/auth`);
  console.log(`   http://${HOST}:${PORT}/api/run`);
  console.log('─────────────────────────────────────');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});