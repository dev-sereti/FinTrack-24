import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateApiBase: process.env.RATE_API_BASE || 'https://api.exchangerate.host',
};