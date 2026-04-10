import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { services } from "../../../../db/schema";
import { eq } from "drizzle-orm";

/* ──────────────────────────────────────────────
   PATCH /api/services/:id
   Admin endpoint
   Toggle a service active/inactive
────────────────────────────────────────────── */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } } // Next.js passes route params
) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const serviceId = Number(params.id); // convert string to number
    const { isActive } = await req.json(); // read from request body

    // Validate input
    if (isNaN(serviceId) || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Update service in DB
    const updated = await db
      .update(services)
      .set({ isActive })
      .where(eq(services.id, serviceId))
      .returning({
        id: services.id,
        isActive: services.isActive,
      });

    if (!updated.length) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Service updated",
      service: updated[0],
    });
  } catch (error) {
    console.error("PATCH /api/services/:id error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}
