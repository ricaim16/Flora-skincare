// Initializes the database connection using Neon (PostgreSQL)

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL!,
});

export const db = drizzle(pool);
