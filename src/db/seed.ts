import { db, hasDatabase } from "./db";
import { services } from "./schema";

async function seed() {
  try {
    if (!hasDatabase || !db) {
      throw new Error("NEON_DB_URL environment variable is not set.");
    }

    await db.insert(services).values([
      { name: "Chemical Peel", slug: "chemical-peel", durationMinutes: 60, priceInCents: 120000, isActive: true },
      { name: "DPN Removal", slug: "dpn-removal", durationMinutes: 75, priceInCents: 150000, isActive: true },
      { name: "Facial", slug: "facial", durationMinutes: 90, priceInCents: 180000, isActive: true },
      { name: "Microneedling", slug: "microneedling", durationMinutes: 90, priceInCents: 200000, isActive: true },
    ]);

    console.log("Seed finished ✅");
  } catch (err) {
    console.error("Seed failed ", err);
  } finally {
    process.exit(0);
  }
}

seed();
