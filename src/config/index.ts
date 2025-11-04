import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Keys (comma-separated)
  API_KEYS: z.string().transform((keys) => 
    keys.split(',').map(k => k.trim()).filter(Boolean)
  ),
  
  // AWS SQS (optional for local dev)
  AWS_REGION: z.string().optional(),
  SQS_QUEUE_URL: z.string().optional(),
  
  // ClickHouse (optional for now)
  CLICKHOUSE_HOST: z.string().optional(),
  CLICKHOUSE_USER: z.string().optional(),
  CLICKHOUSE_PASSWORD: z.string().optional(),
  CLICKHOUSE_DATABASE: z.string().optional(),
  
  // Redis (optional for now)
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export const config = configSchema.parse(process.env);

export type Config = z.infer<typeof configSchema>;


