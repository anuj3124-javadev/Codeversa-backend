const Joi = require('joi');
require('dotenv').config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),

  // MySQL
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USER: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().default(''),
  DB_NAME: Joi.string().default('codeverse'),

  // JWT
  JWT_SECRET: Joi.string().default('fallback-jwt-secret-for-development'),

  // AI Services
  MISTRAL_API_KEY: Joi.string().default(''),
  MISTRAL_MODEL: Joi.string().default('mistral-medium'),
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  GEMINI_API_KEY: Joi.string().optional().allow(''),
  AI_SERVICE: Joi.string().valid('openai', 'gemini', 'mistral').default('mistral'),

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
  error.details.forEach(detail => console.warn(`   - ${detail.message}`));
  console.log('✅ Using default configuration with warnings');
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    dialect: 'mysql'
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: '7d'
  },
  ai: {
    mistralKey: envVars.MISTRAL_API_KEY,
    mistralModel: envVars.MISTRAL_MODEL,
    geminiKey: envVars.GEMINI_API_KEY,
    openaiKey: envVars.OPENAI_API_KEY,
    service: envVars.AI_SERVICE,
    rateLimit: {
      requests: envVars.RATE_LIMIT_REQUESTS,
      windowMs: envVars.RATE_LIMIT_WINDOW_MS
    }
  },
  docker: {
    host: envVars.DOCKER_HOST
  }
};

console.log('✅ Config loaded successfully');
console.log(`🌍 Environment: ${config.env}`);
console.log(`📊 Database: ${config.db.host}:${config.db.port}`);
console.log(`🤖 AI Service: ${config.ai.service}`);
console.log(`🔑 Mistral API Key: ${config.ai.mistralKey ? '✓ Set' : '✗ Missing'}`);

module.exports = config;