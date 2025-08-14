// server/db.ts
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './shared/schema';

// Use WebSocket constructor for Neon serverless
neonConfig.webSocketConstructor = ws;

// Choose database URL:
// 1. Render internal (for deployed server inside Render)
// 2. External (for local/dev) via DATABASE_URL env variable
const INTERNAL_DB_URL =
  'postgresql://alicehub_user:kpDTJFEw0k46SfL28QSCdr2EdIEN99fS@dpg-d2f3aa3ipnbc739m5090-a/alicehub_db';

const DATABASE_URL = process.env.DATABASE_URL || INTERNAL_DB_URL;

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Either provide it in environment variables or check the internal URL.',
  );
}

// Create a connection pool
export const pool = new Pool({ connectionString: DATABASE_URL });

// Initialize Drizzle ORM with the schema
export const db = drizzle({ client: pool, schema });
