import { and, eq, ne } from "drizzle-orm";
import { db } from "../db/db";
import { bookings } from "../db/schema";

export async function findSlotConflict({
  appointmentDate,
  appointmentTime,
  excludeBookingId,
}: {
  appointmentDate: string;
  appointmentTime: string;
  excludeBookingId?: number;
}) {
  if (!db) {
    return null;
  }

  const conditions = [
    eq(bookings.appointmentDate, appointmentDate),
    eq(bookings.appointmentTime, appointmentTime),
    ne(bookings.status, "cancelled"),
  ];

  if (typeof excludeBookingId === "number") {
    conditions.push(ne(bookings.id, excludeBookingId));
  }

  const conflicts = await db
    .select({
      id: bookings.id,
    })
    .from(bookings)
    .where(and(...conditions))
    .limit(1);

  return conflicts[0] ?? null;
}
