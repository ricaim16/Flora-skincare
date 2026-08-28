import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db, hasDatabase } from "../../../../../../src/db/db";
import { expenses } from "../../../../../../src/db/schema";
import { getCurrentSession } from "../../../../../../src/lib/auth";
import { isMissingTableError } from "../../../../../../src/lib/db-errors";
import { fetchBookingAnalyticsRows } from "../../../../../../src/lib/legacy-db";
import {
  getReportRange,
  summarizeAppointmentStatusesForRange,
  summarizeCompletedWorkForRange,
  type ExpenseAnalyticsRecord,
  type ReportPeriod,
} from "../../../../../../src/lib/reporting";

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

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    page.drawText("Flora Skincare Report", {
      x: 50,
      y: 780,
      size: 24,
      font: boldFont,
      color: rgb(0.23, 0.08, 0.42),
    });

    const lines = [
      `Report Type: ${type}`,
      `Period: ${workSummary.rangeLabel}`,
      `Net Revenue: ${(workSummary.netInCents / 100).toLocaleString()} ETB`,
      `Completed Revenue: ${(workSummary.revenueInCents / 100).toLocaleString()} ETB`,
      `Expenses: ${(workSummary.expenseInCents / 100).toLocaleString()} ETB`,
      `Tips: ${(workSummary.tipInCents / 100).toLocaleString()} ETB`,
      `Total Appointments: ${statusSummary.total}`,
      `Completed: ${statusSummary.completed}`,
      `Pending: ${statusSummary.pending}`,
      `Cancelled: ${statusSummary.cancelled}`,
    ];

    let y = 730;
    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y,
        size: 13,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 26;
    }

    const bytes = await pdf.save();

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="flora-${type}-report.pdf"`,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/reports/pdf error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report." },
      { status: 500 }
    );
  }
}
