/**
 * Environment Variables Validation
 * Ensures all required environment variables are present
 */

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'PORT', 'NODE_ENV'];

const validateEnvironment = () => {
  const missingVars = [];

  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`,
    );
  }

  // Validate specific variables
  if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
    throw new Error('PORT must be a valid number');
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  console.log('✅ Environment validation passed');
};

module.exports = validateEnvironment;
