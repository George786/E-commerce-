import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema/index';

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' })

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not found. Database operations may fail.');
}

// Use a valid-format fallback string to avoid build-time errors when env is missing
const connectionString = process.env.DATABASE_URL
  ?? 'postgresql://user:password@localhost:5432/fallback'

const sql = neon(connectionString)
export const db = drizzle(sql, { schema })
