import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { bookings, services } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { findSlotConflict } from "../../../lib/appointments";
import { getCurrentSession, normalizeEmail } from "../../../lib/auth";

type CreateBookingBody = {
  name: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
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

    const session = await getCurrentSession();
    const body = (await req.json()) as CreateBookingBody;
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
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let service:
      | {
          id: number;
          isActive: boolean;
          isMembersOnly: boolean;
          priceInCents: number;
        }
      | undefined;

    try {
      const [selectedService] = await db
        .select()
        .from(services)
        .where(eq(services.id, body.serviceId))
        .limit(1);

      if (selectedService) {
        service = {
          id: selectedService.id,
          isActive: selectedService.isActive,
          isMembersOnly: selectedService.isMembersOnly,
          priceInCents: selectedService.priceInCents,
        };
      }
    } catch (serviceError) {
      if (!isMissingColumnError(serviceError)) {
        throw serviceError;
      }

      const legacyServiceResult = await db.execute(sql`
        select
          id,
          is_active,
          price_in_cents
        from services
        where id = ${body.serviceId}
        limit 1
      `);

      const legacyRow = legacyServiceResult.rows[0];

      if (legacyRow) {
        service = {
          id: Number(legacyRow.id),
          isActive: Boolean(legacyRow.is_active),
          isMembersOnly: false,
          priceInCents: Number(legacyRow.price_in_cents),
        };
      }
    }

    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.isMembersOnly && session?.role !== "customer" && session?.role !== "admin") {
      return NextResponse.json(
        { error: "Please log in to book this service." },
        { status: 401 }
      );
    }

    const existingBooking = await findSlotConflict({
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time is already booked. Please choose another time." },
        { status: 409 }
      );
    }

    let booking;

    try {
      const [createdBooking] = await db
        .insert(bookings)
        .values({
          name: body.name.trim(),
          email,
          phoneNumber: body.phoneNumber.trim(),
          customerId: session?.role === "customer" ? session.id : null,
          serviceId: body.serviceId,
          appointmentDate: body.appointmentDate,
          appointmentTime: body.appointmentTime,
          notes: body.notes?.trim() || "",
          bookingSource: "website",
          priceAtBooking: service.priceInCents,
        })
        .returning();

      booking = createdBooking;
    } catch (insertError) {
      if (!isMissingColumnError(insertError)) {
        throw insertError;
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
          'pending',
          ${body.notes?.trim() || ""},
          false,
          false,
          ${service.priceInCents}
        )
        returning id, name, phone_number, service_id, appointment_date, appointment_time
      `);

      const legacyRow = legacyInsert.rows[0];

      booking = legacyRow
        ? {
            id: Number(legacyRow.id),
            name: String(legacyRow.name),
            phoneNumber: String(legacyRow.phone_number),
            serviceId: Number(legacyRow.service_id),
            appointmentDate: String(legacyRow.appointment_date),
            appointmentTime: String(legacyRow.appointment_time),
          }
        : null;
    }

    return NextResponse.json(
      { message: "Booking created", booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as {
    cause?: {
      code?: string;
    };
  };

  return candidate.cause?.code === "42703";
}
