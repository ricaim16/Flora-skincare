// src/db/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

if (!process.env.NEON_DB_URL) {
  throw new Error("NEON_DB_URL environment variable is not set.");
}

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: {
    rejectUnauthorized: true, // required for Neon
  },
});

export const db = drizzle(pool);
