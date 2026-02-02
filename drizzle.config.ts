// Drizzle CLI configuration

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/app/db/schema.ts",   
  out: "./drizzle",
  dbCredentials: {
    url: process.env.NEON_DB_URL!,
  },
  verbose: true,
  strict: true,
});
