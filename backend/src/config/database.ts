import { Pool } from 'pg';
import Redis from 'redis';
import dotenv from 'dotenv';
import { logger } from '../server';

dotenv.config();

// PostgreSQL configuration
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis:
 2000,
});

// Test PostgreSQL connection
pgPool.connect((err, client, release) => {
  if (err) {
    logger.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    logger.info('Successfully connected to PostgreSQL database');
    release();
  }
});

// Redis client setup
export const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Connect to Redis
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Successfully connected to Redis'));

// Initialize Redis connection
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
  }
};

connectRedis();

export { connectRedis };
