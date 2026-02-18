import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // load .env

const dbUrl = process.env.NEON_DB_URL?.trim();
if (!dbUrl) {
  throw new Error("NEON_DB_URL environment variable is not set.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: dbUrl, 
  },
  verbose: true,
  strict: true,
});
