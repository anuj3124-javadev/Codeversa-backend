const Joi = require('joi');
require('dotenv').config(); // Load .env file

// Schema based on your .env file
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  
  // MySQL Configuration
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().default(''),
  DB_NAME: Joi.string().default('codeverse'),
  
  // JWT
  JWT_SECRET: Joi.string().default('fallback-jwt-secret-for-development'),
  
  // AI Services
  GEMINI_API_KEY: Joi.string().default(''),
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  AI_SERVICE: Joi.string().valid('openai', 'gemini').default('gemini'),
  
  // Docker
  DOCKER_HOST: Joi.string().default('localhost'),
  
  // Rate limiting
  RATE_LIMIT_REQUESTS: Joi.number().default(60),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000)
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env, { 
  abortEarly: false,
  allowUnknown: true
});

if (error) {
  console.warn('⚠️  Config validation warnings:');
  error.details.forEach(detail => {
    console.warn(`   - ${detail.message}`);
  });
  
  // Don't throw error, use defaults
  console.log('✅ Using default configuration with warnings');
}

const config = {
  env: envVars?.NODE_ENV || 'development',
  port: envVars?.PORT || 5000,
  db: {
    host: envVars?.DB_HOST || 'localhost',
    port: envVars?.DB_PORT || 3306,
    user: envVars?.DB_USER || 'root',
    password: envVars?.DB_PASSWORD || '',
    name: envVars?.DB_NAME || 'codeverse',
    dialect: 'mysql'
  },
  jwt: {
    secret: envVars?.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    expiresIn: '7d'
  },
  ai: {
    geminiKey: envVars?.GEMINI_API_KEY,
    openaiKey: envVars?.OPENAI_API_KEY,
    service: envVars?.AI_SERVICE || 'gemini',
    rateLimit: {
      requests: envVars?.RATE_LIMIT_REQUESTS || 60,
      windowMs: envVars?.RATE_LIMIT_WINDOW_MS || 60000
    }
  },
  docker: {
    host: envVars?.DOCKER_HOST || 'localhost'
  }
};

// Log configuration (without sensitive data)
console.log('✅ Config loaded successfully');
console.log(`🌍 Environment: ${config.env}`);
console.log(`📊 Database: ${config.db.host}:${config.db.port}`);
console.log(`📁 Database Name: ${config.db.name}`);
console.log(`👤 Database User: ${config.db.user}`);
console.log(`🤖 AI Service: ${config.ai.service}`);
console.log(`🔑 JWT: ${config.jwt.secret ? '✓ Set' : '✗ Missing'}`);
console.log(`🔑 Gemini API Key: ${config.ai.geminiKey ? '✓ Set' : '✗ Missing'}`);

module.exports = config;