import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { services } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { fallbackServices } from "../../../lib/services";

/* ──────────────────────────────────────────────
   GET /api/services
   Public endpoint
   Returns only active services
────────────────────────────────────────────── */
export async function GET() {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json({
        services: fallbackServices,
        source: "fallback",
        message:
          "Database is not configured. Add NEON_DB_URL to use live services.",
      });
    }

    const activeServices = await db
      .select({
        id: services.id,
        name: services.name,
        slug: services.slug,
        durationMinutes: services.durationMinutes,
        priceInCents: services.priceInCents,
      })
      .from(services)
      .where(eq(services.isActive, true)) // only active services
      .orderBy(services.name); // sort by name alphabetically

    return NextResponse.json({ services: activeServices });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

/* ──────────────────────────────────────────────
   POST /api/services
   Admin endpoint
   Creates a new service (inactive by default)
────────────────────────────────────────────── */
type CreateServiceBody = {
  name: string;
  slug: string;
  durationMinutes?: number; // optional, default 60
  priceInCents: number;
};

export async function POST(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as CreateServiceBody;

    // Validate required fields
    if (!body.name || !body.slug || !body.priceInCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert new service into DB
    const [service] = await db
      .insert(services)
      .values({
        name: body.name,
        slug: body.slug,
        durationMinutes: body.durationMinutes ?? 60, // default 60
        priceInCents: body.priceInCents,
        isActive: false, // future/inactive by default
      })
      .returning();

    return NextResponse.json(
      { message: "Service created", service },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
