const app = require('./app');
const config = require('./config/env');

const PORT = config.port;

app.listen(PORT, () => {
  console.log('🚀 CodeVerse Lite Backend Server Started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log('📋 Available endpoints:');
  console.log(`   http://localhost:${PORT}/health`);
  console.log(`   http://localhost:${PORT}/api/auth`);
  console.log(`   http://localhost:${PORT}/api/run`);
  console.log('─────────────────────────────────────');
});