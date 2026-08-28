import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../db/db";
import { bookings } from "../../../../db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "../../../../lib/auth";

type UpdateBookingBody = {
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const bookingId = Number(params.id);
    const { status } = (await req.json()) as UpdateBookingBody;

    if (isNaN(bookingId) || !status) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!updated.length) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Booking updated",
      booking: updated[0],
    });
  } catch (error) {
    console.error("PATCH /api/bookings/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
