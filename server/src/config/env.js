const DEFAULT_CLIENT_URL = 'http://localhost:5173';
const MIN_JWT_SECRET_LENGTH = 32;

export const isProduction = process.env.NODE_ENV === 'production';

export const getAllowedOrigins = () =>
  (process.env.CLIENT_URL || DEFAULT_CLIENT_URL)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const validateEnv = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long.`);
  }

  if (isProduction && process.env.JWT_SECRET.includes('your_super_secret')) {
    throw new Error('JWT_SECRET is still using the example value.');
  }
};
