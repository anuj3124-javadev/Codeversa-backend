const Joi = require('joi');

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  DB_HOST: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  // Support both OpenAI and Gemini API keys
  OPENAI_API_KEY: Joi.string().optional(),
  GEMINI_API_KEY: Joi.string().required(),
  DOCKER_HOST: Joi.string().default('localhost'),
  // Optional: AI service selection
  AI_SERVICE: Joi.string()
    .valid('openai', 'gemini')
    .default('gemini'),
  // Optional: Rate limiting for Gemini (60 requests per minute)
  RATE_LIMIT_REQUESTS: Joi.number().default(60),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(60000)
}).unknown();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    password: envVars.DB_PASS,
    name: envVars.DB_NAME
  },
  jwt: {
    secret: envVars.JWT_SECRET
  },
  ai: {
    // Support both services
    apiKey: envVars.GEMINI_API_KEY || envVars.OPENAI_API_KEY,
    openaiKey: envVars.OPENAI_API_KEY,
    geminiKey: envVars.GEMINI_API_KEY,
    // Service selection
    service: envVars.AI_SERVICE,
    // Rate limiting
    rateLimit: {
      requests: envVars.RATE_LIMIT_REQUESTS,
      windowMs: envVars.RATE_LIMIT_WINDOW_MS
    }
  },
  docker: {
    host: envVars.DOCKER_HOST
  }
};