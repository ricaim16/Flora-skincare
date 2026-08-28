import { NextResponse } from "next/server";
import { db, hasDatabase } from "../../../../../src/db/db";
import { expenses } from "../../../../../src/db/schema";
import { getCurrentSession } from "../../../../../src/lib/auth";
import { isMissingTableError } from "../../../../../src/lib/db-errors";
import { fetchAdminAppointments, fetchBookingAnalyticsRows } from "../../../../../src/lib/legacy-db";
import {
  buildMonthlyRevenueSeries,
  buildMonthlyStatusSeries,
  getReportRange,
  summarizeAppointmentStatusesForRange,
  summarizeCompletedWorkForRange,
  type BookingAnalyticsRecord,
  type ExpenseAnalyticsRecord,
} from "../../../../../src/lib/reporting";

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

    const allBookings = (await fetchBookingAnalyticsRows()) as BookingAnalyticsRecord[];
    let allExpenses: ExpenseAnalyticsRecord[] = [];

    try {
      allExpenses = (await db.select().from(expenses)) as ExpenseAnalyticsRecord[];
    } catch (error) {
      if (!isMissingTableError(error)) {
        throw error;
      }
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const weeklyRange = getReportRange("weekly", todayStr);
    const monthlyRange = getReportRange("monthly", todayStr);

    const overallWork = summarizeCompletedWorkForRange(
      allBookings,
      allExpenses,
      new Date("2020-01-01"),
      new Date("2100-12-31")
    );
    const todayWork = summarizeCompletedWorkForRange(
      allBookings,
      allExpenses,
      new Date(todayStr),
      new Date(todayStr)
    );
    const weeklyWork = summarizeCompletedWorkForRange(
      allBookings,
      allExpenses,
      weeklyRange.startDate,
      weeklyRange.endDate
    );
    const monthlyWork = summarizeCompletedWorkForRange(
      allBookings,
      allExpenses,
      monthlyRange.startDate,
      monthlyRange.endDate
    );
    const monthlyStatuses = summarizeAppointmentStatusesForRange(
      allBookings,
      monthlyRange.startDate,
      monthlyRange.endDate
    );

    const recentAppointments = (
      await fetchAdminAppointments()
    )
      .sort((left, right) => {
        const leftDate = new Date(
          `${left.appointmentDate}T${left.appointmentTime}`
        ).getTime();
        const rightDate = new Date(
          `${right.appointmentDate}T${right.appointmentTime}`
        ).getTime();

        return rightDate - leftDate;
      })
      .slice(0, 8);

    return NextResponse.json({
      summary: {
        totalNetInCents: overallWork.netInCents,
        totalRevenueInCents: overallWork.revenueInCents,
        totalCompletedAppointments: overallWork.completedCount,
        todayNetInCents: todayWork.netInCents,
        todayCompletedAppointments: todayWork.completedCount,
        weeklyNetInCents: weeklyWork.netInCents,
        weeklyCompletedAppointments: weeklyWork.completedCount,
        monthlyNetInCents: monthlyWork.netInCents,
        monthlyCompletedAppointments: monthlyWork.completedCount,
        monthlyTotalAppointments: monthlyStatuses.total,
        monthlyPendingAppointments: monthlyStatuses.pending,
        monthlyConfirmedAppointments: monthlyStatuses.confirmed,
        monthlyCancelledAppointments: monthlyStatuses.cancelled,
        totalExpensesInCents: overallWork.expenseInCents,
        totalTipsInCents: overallWork.tipInCents,
      },
      revenueSeries: buildMonthlyRevenueSeries(allBookings, allExpenses),
      statusSeries: buildMonthlyStatusSeries(allBookings),
      recentAppointments,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data." },
      { status: 500 }
    );
  }
}
