import { eq, sql } from "drizzle-orm";
import { db } from "../db/db";
import { bookings, services } from "../db/schema";
import { isMissingColumnError } from "./db-errors";
import type { BookingAnalyticsRecord } from "./reporting";

export type AdminAppointmentRow = {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  serviceId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  bookingSource: "website" | "admin";
  priceAtBooking: number;
  createdAt: string;
  serviceName: string | null;
};

export async function fetchBookingAnalyticsRows(): Promise<BookingAnalyticsRecord[]> {
  if (!db) {
    return [];
  }

  try {
    return (await db.select().from(bookings)) as BookingAnalyticsRecord[];
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    const result = await db.execute(sql`
      select
        id,
        name,
        appointment_date,
        appointment_time,
        status,
        price_at_booking
      from bookings
    `);

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      appointmentDate: String(row.appointment_date),
      appointmentTime: String(row.appointment_time),
      status: String(row.status) as BookingAnalyticsRecord["status"],
      priceAtBooking: Number(row.price_at_booking),
    }));
  }
}

export async function fetchAdminAppointments(): Promise<AdminAppointmentRow[]> {
  if (!db) {
    return [];
  }

  try {
    const rows = await db
      .select({
        id: bookings.id,
        name: bookings.name,
        email: bookings.email,
        phoneNumber: bookings.phoneNumber,
        appointmentDate: bookings.appointmentDate,
        appointmentTime: bookings.appointmentTime,
        status: bookings.status,
        notes: bookings.notes,
        bookingSource: bookings.bookingSource,
        priceAtBooking: bookings.priceAtBooking,
        createdAt: bookings.createdAt,
        serviceId: bookings.serviceId,
        serviceName: services.name,
      })
      .from(bookings)
      .leftJoin(services, eq(bookings.serviceId, services.id));

    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      email: row.email,
      phoneNumber: row.phoneNumber,
      notes: row.notes,
      bookingSource: row.bookingSource,
      serviceName: row.serviceName,
    }));
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    const result = await db.execute(sql`
      select
        b.id,
        b.name,
        b.phone_number,
        b.service_id,
        b.appointment_date,
        b.appointment_time,
        b.status,
        b.notes,
        b.price_at_booking,
        b.created_at,
        s.name as service_name
      from bookings b
      left join services s on b.service_id = s.id
      order by b.appointment_date desc, b.appointment_time desc
    `);

    return result.rows.map((row) => ({
      id: Number(row.id),
      name: String(row.name),
      email: "",
      phoneNumber: String(row.phone_number),
      serviceId: Number(row.service_id),
      appointmentDate: String(row.appointment_date),
      appointmentTime: String(row.appointment_time),
      status: String(row.status) as AdminAppointmentRow["status"],
      notes: row.notes ? String(row.notes) : null,
      bookingSource: "website",
      priceAtBooking: Number(row.price_at_booking),
      createdAt: new Date(String(row.created_at)).toISOString(),
      serviceName: row.service_name ? String(row.service_name) : null,
    }));
  }
}

export async function fetchServicePriceById(serviceId: number) {
  if (!db) {
    return null;
  }

  try {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId))
      .limit(1);

    if (!service) {
      return null;
    }

    return {
      id: service.id,
      priceInCents: service.priceInCents,
    };
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error;
    }

    const result = await db.execute(sql`
      select id, price_in_cents
      from services
      where id = ${serviceId}
      limit 1
    `);

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: Number(row.id),
      priceInCents: Number(row.price_in_cents),
    };
  }
}
