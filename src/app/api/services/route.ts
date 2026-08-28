import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { services } from "../../../db/schema";
import { fallbackServices } from "../../../lib/services";
import { getCurrentSession } from "../../../lib/auth";
import { sql } from "drizzle-orm";
import { isMissingColumnError } from "../../../lib/db-errors";

type CreateServiceBody = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  durationMinutes?: number;
  priceInCents: number;
  isActive?: boolean;
  isMembersOnly?: boolean;
};

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    const url = new URL(req.url);
    const adminMode = url.searchParams.get("mode") === "admin";
    const canViewExclusive = session?.role === "customer" || session?.role === "admin";
    const canManage = adminMode && session?.role === "admin";

    if (!hasDatabase || !db) {
      return NextResponse.json({
        services: canManage
          ? fallbackServices
          : fallbackServices.filter((service) => !service.isMembersOnly),
        source: "fallback",
        message:
          "Database is not configured. Add NEON_DB_URL to use live services.",
        hasExclusiveServices: false,
      });
    }

    let allServices = await db.select().from(services).orderBy(services.name);

    if (!Array.isArray(allServices)) {
      allServices = [];
    }

    const visibleServices = canManage
      ? allServices
      : allServices.filter((service) => {
          if (!service.isActive) {
            return false;
          }

          if (service.isMembersOnly && !canViewExclusive) {
            return false;
          }

          return true;
        });

    return NextResponse.json({
      services: visibleServices,
      hasExclusiveServices: allServices.some(
        (service) => service.isActive && service.isMembersOnly
      ),
    });
  } catch (error) {
    if (isMissingColumnError(error)) {
      try {
        const session = await getCurrentSession();
        const url = new URL(req.url);
        const adminMode = url.searchParams.get("mode") === "admin";
        const canViewExclusive =
          session?.role === "customer" || session?.role === "admin";
        const canManage = adminMode && session?.role === "admin";
        const legacyResult = await db?.execute(sql`
          select
            id,
            name,
            slug,
            duration_minutes,
            price_in_cents,
            is_active
          from services
          order by name
        `);

        const legacyServices = (legacyResult?.rows ?? []).map((row) => ({
          id: Number(row.id),
          name: String(row.name),
          slug: String(row.slug),
          description: "Personalized skincare treatment.",
          imageUrl: null,
          durationMinutes: Number(row.duration_minutes),
          priceInCents: Number(row.price_in_cents),
          isActive: Boolean(row.is_active),
          isMembersOnly: false,
        }));

        return NextResponse.json({
          services: canManage
            ? legacyServices
            : legacyServices.filter((service) => {
                if (!service.isActive) {
                  return false;
                }

                if (service.isMembersOnly && !canViewExclusive) {
                  return false;
                }

                return true;
              }),
          hasExclusiveServices: false,
          schemaMode: "legacy",
        });
      } catch (legacyError) {
        console.error("GET /api/services legacy fallback error:", legacyError);
      }
    }

    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = (await req.json()) as CreateServiceBody;

    if (!body.name || !body.slug || !body.priceInCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let service;

    try {
      [service] = await db
        .insert(services)
        .values({
          name: body.name.trim(),
          slug: body.slug.trim(),
          description: body.description?.trim() || "Personalized skincare treatment.",
          imageUrl: body.imageUrl?.trim() || null,
          durationMinutes: body.durationMinutes ?? 60,
          priceInCents: body.priceInCents,
          isActive: body.isActive ?? true,
          isMembersOnly: body.isMembersOnly ?? false,
        })
        .returning();
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyResult = await db.execute(sql`
        insert into services (
          name,
          slug,
          duration_minutes,
          price_in_cents,
          is_active
        ) values (
          ${body.name.trim()},
          ${body.slug.trim()},
          ${body.durationMinutes ?? 60},
          ${body.priceInCents},
          ${body.isActive ?? true}
        )
        returning id, name, slug, duration_minutes, price_in_cents, is_active
      `);

      const row = legacyResult.rows[0];
      service = row
        ? {
            id: Number(row.id),
            name: String(row.name),
            slug: String(row.slug),
            description: body.description?.trim() || "Personalized skincare treatment.",
            imageUrl: null,
            durationMinutes: Number(row.duration_minutes),
            priceInCents: Number(row.price_in_cents),
            isActive: Boolean(row.is_active),
            isMembersOnly: false,
          }
        : null;
    }

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
