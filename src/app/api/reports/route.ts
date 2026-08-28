import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../db/db";
import { expenses, reports } from "../../../db/schema";
import { getCurrentSession } from "../../../lib/auth";
import { isMissingTableError } from "../../../lib/db-errors";
import { fetchBookingAnalyticsRows } from "../../../lib/legacy-db";
import {
  getReportRange,
  summarizeAppointmentStatusesForRange,
  summarizeCompletedWorkForRange,
  type ExpenseAnalyticsRecord,
  type ReportPeriod,
} from "../../../lib/reporting";

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const type = (url.searchParams.get("type") as ReportPeriod) || "custom";
    const anchorDate =
      url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const range = getReportRange(type, anchorDate, startDateParam, endDateParam);

    const allBookings = await fetchBookingAnalyticsRows();
    let allExpenses: ExpenseAnalyticsRecord[] = [];

    try {
      allExpenses = (await db.select().from(expenses)) as ExpenseAnalyticsRecord[];
    } catch (error) {
      if (!isMissingTableError(error)) {
        throw error;
      }
    }

    const workSummary = summarizeCompletedWorkForRange(
      allBookings,
      allExpenses,
      range.startDate,
      range.endDate
    );
    const statusSummary = summarizeAppointmentStatusesForRange(
      allBookings,
      range.startDate,
      range.endDate
    );
    const startDate = range.startDate.toISOString().slice(0, 10);
    const endDate = range.endDate.toISOString().slice(0, 10);

    if (type !== "custom") {
      const [existing] = await db
        .select()
        .from(reports)
        .where(
          and(
            eq(reports.reportType, type),
            eq(reports.startDate, startDate),
            eq(reports.endDate, endDate)
          )
        )
        .orderBy(desc(reports.id))
        .limit(1);

      if (existing) {
        await db
          .update(reports)
          .set({
            totalClients: statusSummary.total,
            totalRevenueInCents: workSummary.netInCents,
          })
          .where(eq(reports.id, existing.id));
      } else {
        await db.insert(reports).values({
          reportType: type,
          totalClients: statusSummary.total,
          totalRevenueInCents: workSummary.netInCents,
          startDate,
          endDate,
        });
      }
    }

    const history = await db
      .select()
      .from(reports)
      .orderBy(desc(reports.createdAt), desc(reports.id))
      .limit(20);

    return NextResponse.json({
      report: {
        reportType: type,
        totalAppointments: statusSummary.total,
        completedAppointments: statusSummary.completed,
        confirmedAppointments: statusSummary.confirmed,
        pendingAppointments: statusSummary.pending,
        cancelledAppointments: statusSummary.cancelled,
        totalRevenueInCents: workSummary.revenueInCents,
        totalExpensesInCents: workSummary.expenseInCents,
        totalTipsInCents: workSummary.tipInCents,
        netRevenueInCents: workSummary.netInCents,
        startDate,
        endDate,
        rangeLabel: workSummary.rangeLabel,
        generatedAt: new Date().toISOString(),
      },
      history,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
