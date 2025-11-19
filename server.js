const app = require('./app');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('🚀 CodeVerse Lite Backend Server Started');
  console.log(`📍 Host: ${HOST}`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Live URL: https://codeversa-backend.onrender.com`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log('📋 Available endpoints:');
  console.log(`   https://codeversa-backend.onrender.com/health`);
  console.log(`   https://codeversa-backend.onrender.com/api/auth`);
  console.log(`   https://codeversa-backend.onrender.com/api/run`);
  console.log('─────────────────────────────────────');
});

// Improved graceful shutdown for Render
let isShuttingDown = false;

process.on('SIGTERM', () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.log('⚠️  Forcing shutdown...');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});