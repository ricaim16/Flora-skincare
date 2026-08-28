import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { customers } from "../../../../../src/db/schema";
import { getCurrentSession } from "../../../../../src/lib/auth";
import { isMissingTableError } from "../../../../../src/lib/db-errors";
import { fetchAdminAppointments } from "../../../../../src/lib/legacy-db";

export async function GET() {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        { error: "Database is not configured. Add NEON_DB_URL first." },
        { status: 503 }
      );
    }

    const session = await getCurrentSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingRows = await fetchAdminAppointments();
    let customerRows: Array<{
      id: number;
      name: string;
      email: string;
      createdAt: Date;
    }> = [];

    try {
      customerRows = await db.select().from(customers).orderBy(desc(customers.createdAt));
    } catch (error) {
      if (!isMissingTableError(error)) {
        throw error;
      }
    }

    const byEmail = new Map<
      string,
      {
        id: number | null;
        name: string;
        email: string;
        createdAt: string;
        totalAppointments: number;
        completedAppointments: number;
        totalSpentInCents: number;
      }
    >();

    for (const customer of customerRows) {
      byEmail.set(customer.email, {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        createdAt: customer.createdAt.toISOString(),
        totalAppointments: 0,
        completedAppointments: 0,
        totalSpentInCents: 0,
      });
    }

    for (const booking of bookingRows) {
      const email = booking.email || `${booking.name}-${booking.id}@local`;
      const existing =
        byEmail.get(email) ??
        {
          id: null,
          name: booking.name,
          email,
          createdAt: booking.createdAt,
          totalAppointments: 0,
          completedAppointments: 0,
          totalSpentInCents: 0,
        };

      existing.totalAppointments += 1;
      if (booking.status === "completed") {
        existing.completedAppointments += 1;
        existing.totalSpentInCents += booking.priceAtBooking;
      }

      byEmail.set(email, existing);
    }

    return NextResponse.json({
      customers: Array.from(byEmail.values()).sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      ),
    });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { error: "Failed to load customers." },
      { status: 500 }
    );
  }
}
