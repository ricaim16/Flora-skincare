import { db } from "./db";
import { services } from "./schema";

async function seed() {
  try {
    await db.insert(services).values([
      { name: "Facial Glow", slug: "facial-glow", durationMinutes: 60, priceInCents: 120000, isActive: true },
      { name: "Deep Cleansing", slug: "deep-cleansing", durationMinutes: 75, priceInCents: 150000, isActive: true },
      { name: "Acne Treatment", slug: "acne-treatment", durationMinutes: 90, priceInCents: 180000, isActive: true },
      { name: "Glow Therapy", slug: "glow-therapy", durationMinutes: 90, priceInCents: 200000, isActive: true },
    ]);

    console.log("Seed finished ✅");
  } catch (err) {
    console.error("Seed failed ", err);
  } finally {
    process.exit(0);
  }
}

seed();
