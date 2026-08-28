import { db, hasDatabase } from "./db";
import { admins, services } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    if (!hasDatabase || !db) {
      throw new Error("NEON_DB_URL environment variable is not set.");
    }

    const passwordHash = await bcrypt.hash("123456", 10);

    await db
      .insert(admins)
      .values({
        name: "Manager",
        email: "kibatugidey0@gmail.com",
        passwordHash,
      })
      .onConflictDoNothing({ target: admins.email });

    await db
      .insert(services)
      .values([
        {
          name: "Chemical Peel",
          slug: "chemical-peel",
          description: "Brightening exfoliation treatment for smoother, clearer skin.",
          durationMinutes: 60,
          priceInCents: 120000,
          isActive: true,
          isMembersOnly: false,
          imageUrl: "/Chemical peel.jpg",
        },
        {
          name: "DPN Removal",
          slug: "dpn-removal",
          description: "Targeted treatment for safe and careful DPN removal sessions.",
          durationMinutes: 75,
          priceInCents: 150000,
          isActive: true,
          isMembersOnly: false,
          imageUrl: "/DPN removal.jpg",
        },
        {
          name: "Facial",
          slug: "facial",
          description: "Deep cleansing facial focused on hydration, glow, and recovery.",
          durationMinutes: 90,
          priceInCents: 180000,
          isActive: true,
          isMembersOnly: false,
          imageUrl: "/facial.jpg",
        },
        {
          name: "Microneedling",
          slug: "microneedling",
          description: "Texture-refining microneedling to support smoother, healthier skin.",
          durationMinutes: 90,
          priceInCents: 200000,
          isActive: true,
          isMembersOnly: false,
          imageUrl: "/Microneedling.jpg",
        },
        {
          name: "Skin Consultation",
          slug: "skin-consultation",
          description: "Members-only consultation with a tailored skin treatment plan.",
          durationMinutes: 45,
          priceInCents: 90000,
          isActive: true,
          isMembersOnly: true,
          imageUrl: "/Consultation.jpg",
        },
        {
          name: "Dermaplaning",
          slug: "dermaplaning",
          description: "Members-only resurfacing service for a smooth makeup-ready finish.",
          durationMinutes: 60,
          priceInCents: 160000,
          isActive: true,
          isMembersOnly: true,
          imageUrl: "/Dermaplaning.jpg",
        },
      ])
      .onConflictDoNothing({ target: services.slug });

    console.log("Seed finished ✅");
  } catch (err) {
    console.error("Seed failed ", err);
  } finally {
    process.exit(0);
  }
}

seed();
