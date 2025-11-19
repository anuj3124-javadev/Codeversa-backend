const Joi = require('joi');

// Relaxed schema for Render deployment
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  
  // Make database config optional with SQLite fallback
  DB_HOST: Joi.string().optional(),
  DB_USER: Joi.string().optional(),
  DB_PASS: Joi.string().optional(),
  DB_NAME: Joi.string().optional(),
  DB_STORAGE: Joi.string().default('/tmp/codeverse.sqlite'),
  DB_DIALECT: Joi.string().valid('mysql', 'sqlite').default('sqlite'),
  
  JWT_SECRET: Joi.string().default('fallback-jwt-secret-for-render'),
  
  // Make AI keys optional (app will work without AI features)
  OPENAI_API_KEY: Joi.string().optional().allow(''),
  GEMINI_API_KEY: Joi.string().optional().allow(''),
  
  DOCKER_HOST: Joi.string().default('localhost'),
  
  AI_SERVICE: Joi.string()
    .valid('openai', 'gemini')
    .default('gemini'),
  
  RATE_LIMIT_REQUESTS: Joi.number().default(60),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000)
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env, { 
  abortEarly: false,
  allowUnknown: true
});

if (error) {
  console.warn('⚠️  Config validation warnings:', error.details.map(d => d.message));
  // Don't throw error in production, use defaults
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Using default configuration for production');
  } else {
    throw new Error(`Config validation error: ${error.message}`);
  }
}

// Fallback configuration for Render
const config = {
  env: envVars?.NODE_ENV || 'production',
  port: envVars?.PORT || process.env.PORT || 5000,
  db: {
    host: envVars?.DB_HOST,
    user: envVars?.DB_USER,
    password: envVars?.DB_PASS,
    name: envVars?.DB_NAME,
    storage: envVars?.DB_STORAGE || '/tmp/codeverse.sqlite',
    dialect: envVars?.DB_DIALECT || 'sqlite'
  },
  jwt: {
    secret: envVars?.JWT_SECRET || 'render-fallback-jwt-secret'
  },
  ai: {
    apiKey: envVars?.GEMINI_API_KEY || envVars?.OPENAI_API_KEY,
    openaiKey: envVars?.OPENAI_API_KEY,
    geminiKey: envVars?.GEMINI_API_KEY,
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

console.log('✅ Config loaded for environment:', config.env);
console.log('📊 Database dialect:', config.db.dialect);
console.log('🔑 JWT configured:', !!config.jwt.secret);
console.log('🤖 AI service:', config.ai.service, '- API key:', !!config.ai.apiKey);

module.exports = config;