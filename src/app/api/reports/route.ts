import { NextResponse } from "next/server";
import { db } from "../../../db/db";
import { bookings, reports } from "../../../db/schema";
import { eq, gte, lte, and } from "drizzle-orm";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  parseISO,
} from "date-fns";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams;

    // Get query params
    const type = (query.get("type") as "weekly" | "monthly" | "yearly") || "weekly";
    const dateStr = query.get("date") || new Date().toISOString().slice(0, 10);
    const date = parseISO(dateStr);

    // Determine start and end dates
    let startDate: Date;
    let endDate: Date;

    if (type === "weekly") {
      startDate = startOfWeek(date, { weekStartsOn: 1 });
      endDate = endOfWeek(date, { weekStartsOn: 1 });
    } else if (type === "monthly") {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    } else {
      startDate = startOfYear(date);
      endDate = endOfYear(date);
    }

    // Convert JS Date -> YYYY-MM-DD for Postgres
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // ✅ Check for cached report
    const cached = await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.reportType, type),
          eq(reports.startDate, startDateStr),
          eq(reports.endDate, endDateStr)
        )
      );

    if (cached.length) {
      return NextResponse.json({ report: cached[0] });
    }

    // ✅ Aggregate bookings
    const allBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.appointmentDate, startDateStr),
          lte(bookings.appointmentDate, endDateStr)
        )
      );

    const totalClients = allBookings.length;
    const totalRevenueInCents = allBookings.reduce((sum, b) => sum + b.priceAtBooking, 0);

    // ✅ Cache the report
    const [savedReport] = await db
      .insert(reports)
      .values({
        reportType: type,
        totalClients,
        totalRevenueInCents,
        startDate: startDateStr,
        endDate: endDateStr,
      })
      .returning();

    return NextResponse.json({ report: savedReport });
  } catch (error: any) {
    console.error("GET /api/reports error:", error.message);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
