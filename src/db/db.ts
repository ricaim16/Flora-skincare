// src/db/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const databaseUrl = process.env.NEON_DB_URL?.trim();

export const hasDatabase = Boolean(databaseUrl);

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: true, // required for Neon
      },
    })
  : null;

export const db = pool ? drizzle(pool) : null;
