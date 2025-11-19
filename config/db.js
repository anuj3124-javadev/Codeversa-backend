const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// For Render: Use /tmp directory which is writable
const dbPath = process.env.DB_STORAGE || '/tmp/codeverse.sqlite';

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  dialectModule: require('better-sqlite3'), // Use better-sqlite3
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  }
});

// Test database connection with better error handling
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database - use force: false to preserve data
    await sequelize.sync({ force: false });
    console.log('✅ Database synced successfully.');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Don't crash the app in production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Continuing without database connection...');
      return false;
    } else {
      throw error;
    }
  }
};

// Don't block the server startup
testConnection().catch(console.error);

module.exports = sequelize;