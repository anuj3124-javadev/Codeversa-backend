const { Sequelize } = require('sequelize');
const config = require('./env');

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  logging: config.env === 'development' ? console.log : false,
  pool: {
    max: 10, // Increased for production
    min: 0,
    acquire: 60000, // Increased timeout
    idle: 10000
  },
  retry: {
    max: 5, // Increased retry attempts
    match: [
      /ETIMEDOUT/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ESOCKETTIMEDOUT/,
      /EHOSTUNREACH/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
  },
  dialectOptions: {
    // Important for remote MySQL connections
    connectTimeout: 60000,
    timeout: 60000,
    // Add SSL if your MySQL provider requires it
    ssl: config.env === 'production' ? {
      rejectUnauthorized: false
    } : false
  },
  // Additional connection settings
  timezone: '+00:00' // UTC timezone
});

// Enhanced connection test with better error handling
const testConnection = async () => {
  let retries = 3;
  
  while (retries > 0) {
    try {
      console.log(`🔗 Attempting to connect to MySQL: ${config.db.host}:${config.db.port}`);
      
      await sequelize.authenticate();
      console.log('✅ MySQL database connection established successfully.');
      
      // Sync database
      await sequelize.sync({ force: false });
      console.log('✅ Database synced successfully.');
      
      return true;
    } catch (error) {
      retries--;
      console.error(`❌ MySQL connection failed (${retries} retries left):`, error.message);
      
      if (retries === 0) {
        if (config.env === 'production') {
          console.log('⚠️  Continuing without database connection in production...');
          return false;
        } else {
          console.log('💡 Check your MySQL configuration:');
          console.log(`   Host: ${config.db.host}`);
          console.log(`   Port: ${config.db.port}`);
          console.log(`   Database: ${config.db.name}`);
          console.log(`   User: ${config.db.user}`);
          throw error;
        }
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Don't block server startup
setTimeout(() => {
  testConnection().catch(error => {
    console.error('💥 Database connection failed after retries:', error.message);
  });
}, 1000);

module.exports = sequelize;