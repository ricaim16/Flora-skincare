import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { bookings } from "../../../../../src/db/schema";
import { findSlotConflict } from "../../../../../src/lib/appointments";
import { getCurrentSession, normalizeEmail } from "../../../../../src/lib/auth";
import { isMissingColumnError } from "../../../../../src/lib/db-errors";
import {
  fetchAdminAppointments,
  fetchServicePriceById,
} from "../../../../../src/lib/legacy-db";
import { sql } from "drizzle-orm";

type AppointmentBody = {
  name: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
  status?: "pending" | "confirmed" | "completed" | "cancelled";
};

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

    const appointments = await fetchAdminAppointments();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("GET /api/admin/appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    const body = (await req.json()) as AppointmentBody;
    const email = normalizeEmail(body.email || "");

    if (
      !body.name ||
      !email ||
      !body.phoneNumber ||
      !body.serviceId ||
      !body.appointmentDate ||
      !body.appointmentTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const service = await fetchServicePriceById(body.serviceId);

    if (!service) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }

    const conflict = await findSlotConflict({
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
    });

    if (conflict) {
      return NextResponse.json(
        { error: "This time is already booked. Please choose another time." },
        { status: 409 }
      );
    }

    let appointment;

    try {
      [appointment] = await db
        .insert(bookings)
        .values({
          name: body.name.trim(),
          email,
          phoneNumber: body.phoneNumber.trim(),
          serviceId: body.serviceId,
          appointmentDate: body.appointmentDate,
          appointmentTime: body.appointmentTime,
          notes: body.notes?.trim() || "",
          status: body.status ?? "confirmed",
          bookingSource: "admin",
          priceAtBooking: service.priceInCents,
        })
        .returning();
    } catch (error) {
      if (!isMissingColumnError(error)) {
        throw error;
      }

      const legacyInsert = await db.execute(sql`
        insert into bookings (
          name,
          phone_number,
          service_id,
          appointment_date,
          appointment_time,
          status,
          notes,
          email_sent,
          admin_notified,
          price_at_booking
        ) values (
          ${body.name.trim()},
          ${body.phoneNumber.trim()},
          ${body.serviceId},
          ${body.appointmentDate},
          ${body.appointmentTime},
          ${body.status ?? "confirmed"},
          ${body.notes?.trim() || ""},
          false,
          false,
          ${service.priceInCents}
        )
        returning id, name
      `);

      appointment = legacyInsert.rows[0] ?? null;
    }

    return NextResponse.json(
      { message: "Appointment added successfully.", appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/appointments error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}
