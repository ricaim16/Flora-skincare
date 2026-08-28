import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { services } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentSession } from "../../../../lib/auth";
import { isMissingColumnError } from "../../../../lib/db-errors";

type UpdateServiceBody = {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  durationMinutes?: number;
  priceInCents?: number;
  isActive?: boolean;
  isMembersOnly?: boolean;
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceId = Number(params.id);
    const body = (await req.json()) as UpdateServiceBody;

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (typeof body.slug === "string") {
      updates.slug = body.slug.trim();
    }

    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }

    if (typeof body.imageUrl === "string") {
      updates.imageUrl = body.imageUrl.trim() || null;
    }

    if (body.imageUrl === null) {
      updates.imageUrl = null;
    }

    if (typeof body.durationMinutes === "number") {
      updates.durationMinutes = body.durationMinutes;
    }

    if (typeof body.priceInCents === "number") {
      updates.priceInCents = body.priceInCents;
    }

    if (typeof body.isActive === "boolean") {
      updates.isActive = body.isActive;
    }

    if (typeof body.isMembersOnly === "boolean") {
      updates.isMembersOnly = body.isMembersOnly;
    }

    let updated;

    try {
      updated = await db
        .update(services)
        .set(updates)
        .where(eq(services.id, serviceId))
        .returning();
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyResult = await db.execute(sql`
        update services
        set
          name = ${typeof body.name === "string" ? body.name.trim() : sql`name`},
          slug = ${typeof body.slug === "string" ? body.slug.trim() : sql`slug`},
          duration_minutes = ${typeof body.durationMinutes === "number" ? body.durationMinutes : sql`duration_minutes`},
          price_in_cents = ${typeof body.priceInCents === "number" ? body.priceInCents : sql`price_in_cents`},
          is_active = ${typeof body.isActive === "boolean" ? body.isActive : sql`is_active`}
        where id = ${serviceId}
        returning id, name, slug, duration_minutes, price_in_cents, is_active
      `);

      updated = legacyResult.rows.map((row) => ({
        id: Number(row.id),
        name: String(row.name),
        slug: String(row.slug),
        description: body.description?.trim() || "Personalized skincare treatment.",
        imageUrl: null,
        durationMinutes: Number(row.duration_minutes),
        priceInCents: Number(row.price_in_cents),
        isActive: Boolean(row.is_active),
        isMembersOnly: false,
      }));
    }

    if (!updated.length) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Service updated",
      service: updated[0],
    });
  } catch (error) {
    console.error("PATCH /api/services/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();

    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceId = Number(params.id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const deleted = await db
      .delete(services)
      .where(eq(services.id, serviceId))
      .returning({ id: services.id });

    if (!deleted.length) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/services/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
