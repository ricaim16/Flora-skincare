import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { bookings, services } from "../../../db/schema";
import { eq } from "drizzle-orm";

type CreateBookingBody = {
  name: string;
  phoneNumber: string;
  serviceId: number;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  notes?: string;
};

export async function POST(req: Request) {
  try {
    if (!hasDatabase || !db) {
      return NextResponse.json(
        {
          error:
            "Bookings are unavailable until the database is configured with NEON_DB_URL.",
        },
        { status: 503 }
      );
    }

    const body = (await req.json()) as CreateBookingBody;

    // Validate input
    if (
      !body.name ||
      !body.phoneNumber ||
      !body.serviceId ||
      !body.appointmentDate ||
      !body.appointmentTime
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch service to get price
    const service = await db
      .select()
      .from(services)
      .where(eq(services.id, body.serviceId))
      .limit(1);

    if (!service[0]) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Insert booking
    const [booking] = await db
      .insert(bookings)
      .values({
        name: body.name,
        phoneNumber: body.phoneNumber,
        serviceId: body.serviceId,
        appointmentDate: body.appointmentDate,
        appointmentTime: body.appointmentTime,
        notes: body.notes ?? "",
        priceAtBooking: service[0].priceInCents,
      })
      .returning();

    return NextResponse.json({ message: "Booking created", booking }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bookings error:", error.message);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
