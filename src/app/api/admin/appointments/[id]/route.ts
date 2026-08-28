import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../../src/db/db";
import { bookings } from "../../../../../../src/db/schema";
import { findSlotConflict } from "../../../../../../src/lib/appointments";
import {
  getCurrentSession,
  normalizeEmail,
} from "../../../../../../src/lib/auth";
import { isMissingColumnError } from "../../../../../../src/lib/db-errors";
import { fetchServicePriceById } from "../../../../../../src/lib/legacy-db";

type UpdateAppointmentBody = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  serviceId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  notes?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
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
    const body = (await req.json()) as UpdateAppointmentBody;

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    let existingBooking;

    try {
      [existingBooking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyResult = await db.execute(sql`
        select
          id,
          name,
          phone_number,
          service_id,
          appointment_date,
          appointment_time,
          status,
          notes,
          price_at_booking
        from bookings
        where id = ${bookingId}
        limit 1
      `);

      const row = legacyResult.rows[0];
      existingBooking = row
        ? {
            id: Number(row.id),
            name: String(row.name),
            email: "",
            phoneNumber: String(row.phone_number),
            serviceId: Number(row.service_id),
            appointmentDate: String(row.appointment_date),
            appointmentTime: String(row.appointment_time),
            status: String(row.status),
            notes: row.notes ? String(row.notes) : "",
            priceAtBooking: Number(row.price_at_booking),
          }
        : undefined;
    }

    if (!existingBooking) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    const nextDate = body.appointmentDate ?? existingBooking.appointmentDate;
    const nextTime = body.appointmentTime ?? existingBooking.appointmentTime;

    const conflict = await findSlotConflict({
      appointmentDate: nextDate,
      appointmentTime: nextTime,
      excludeBookingId: bookingId,
    });

    if (conflict) {
      return NextResponse.json(
        { error: "This time is already booked. Please choose another time." },
        { status: 409 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof body.name === "string") {
      updates.name = body.name.trim();
    }

    if (typeof body.email === "string") {
      updates.email = normalizeEmail(body.email);
    }

    if (typeof body.phoneNumber === "string") {
      updates.phoneNumber = body.phoneNumber.trim();
    }

    if (typeof body.appointmentDate === "string") {
      updates.appointmentDate = body.appointmentDate;
    }

    if (typeof body.appointmentTime === "string") {
      updates.appointmentTime = body.appointmentTime;
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes.trim();
    }

    if (body.status) {
      updates.status = body.status;
    }

    if (typeof body.serviceId === "number") {
      const service = await fetchServicePriceById(body.serviceId);

      if (!service) {
        return NextResponse.json({ error: "Service not found." }, { status: 404 });
      }

      updates.serviceId = body.serviceId;
      updates.priceAtBooking = service.priceInCents;
    }

    let updatedAppointment;

    try {
      [updatedAppointment] = await db
        .update(bookings)
        .set(updates)
        .where(eq(bookings.id, bookingId))
        .returning();
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyResult = await db.execute(sql`
        update bookings
        set
          name = ${typeof body.name === "string" ? body.name.trim() : sql`name`},
          phone_number = ${typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : sql`phone_number`},
          service_id = ${typeof body.serviceId === "number" ? body.serviceId : sql`service_id`},
          appointment_date = ${typeof body.appointmentDate === "string" ? body.appointmentDate : sql`appointment_date`},
          appointment_time = ${typeof body.appointmentTime === "string" ? body.appointmentTime : sql`appointment_time`},
          status = ${body.status ? body.status : sql`status`},
          notes = ${typeof body.notes === "string" ? body.notes.trim() : sql`notes`},
          price_at_booking = ${typeof updates.priceAtBooking === "number" ? updates.priceAtBooking : sql`price_at_booking`}
        where id = ${bookingId}
        returning id, name
      `);

      updatedAppointment = legacyResult.rows[0] ?? null;
    }

    return NextResponse.json({
      message: "Appointment updated successfully.",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("PATCH /api/admin/appointments/:id error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
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

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const deleted = await db
      .delete(bookings)
      .where(eq(bookings.id, bookingId))
      .returning({ id: bookings.id });

    if (!deleted.length) {
      return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Appointment deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/admin/appointments/:id error:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment." },
      { status: 500 }
    );
  }
}
