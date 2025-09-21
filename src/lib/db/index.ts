import { drizzle } from 'drizzle-orm/neon-http'
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema/index'

import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Initialize DB lazily to prevent build-time failures when env is missing
let dbInstance: NeonHttpDatabase<typeof schema>

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL)
  dbInstance = drizzle(sql, { schema })
} else {
  console.warn('DATABASE_URL not found. Exporting a guarded db proxy. Operations will fail at runtime if used.')
  const handler: ProxyHandler<Record<string, unknown>> = {
    get () {
      throw new Error('Database not configured. Set DATABASE_URL to use the database.')
    },
  }
  // Cast to the expected drizzle type to satisfy TypeScript without executing any DB calls
  dbInstance = new Proxy({}, handler) as unknown as NeonHttpDatabase<typeof schema>
}

export const db = dbInstance
