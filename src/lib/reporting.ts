import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

export type BookingAnalyticsRecord = {
  id: number;
  name?: string;
  email?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  priceAtBooking: number;
};

export type ExpenseAnalyticsRecord = {
  id: number;
  entryDate: string;
  entryType: "expense" | "tip";
  amountInCents: number;
  title?: string;
  note?: string | null;
};

export type ReportPeriod = "weekly" | "monthly" | "yearly" | "custom";

export function getReportRange(
  period: ReportPeriod,
  dateStr: string,
  startDateStr?: string | null,
  endDateStr?: string | null
) {
  if (period === "custom") {
    const startDate = parseISO(startDateStr || dateStr);
    const endDate = parseISO(endDateStr || dateStr);

    return { startDate, endDate };
  }

  const date = parseISO(dateStr);

  if (period === "weekly") {
    return {
      startDate: startOfWeek(date, { weekStartsOn: 1 }),
      endDate: endOfWeek(date, { weekStartsOn: 1 }),
    };
  }

  if (period === "monthly") {
    return {
      startDate: startOfMonth(date),
      endDate: endOfMonth(date),
    };
  }

  return {
    startDate: startOfYear(date),
    endDate: endOfYear(date),
  };
}

export function isCompletedBooking(status: BookingAnalyticsRecord["status"]) {
  return status === "completed";
}

export function formatRangeLabel(startDate: Date, endDate: Date) {
  return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
}

export function summarizeCompletedWorkForRange(
  bookings: BookingAnalyticsRecord[],
  expenses: ExpenseAnalyticsRecord[],
  startDate: Date,
  endDate: Date
) {
  const completedBookings = bookings.filter((booking) => {
    const bookingDate = parseISO(booking.appointmentDate);

    return (
      isCompletedBooking(booking.status) &&
      isWithinInterval(bookingDate, { start: startDate, end: endDate })
    );
  });

  const matchingExpenses = expenses.filter((entry) => {
    const entryDate = parseISO(entry.entryDate);
    return isWithinInterval(entryDate, { start: startDate, end: endDate });
  });

  const revenueInCents = completedBookings.reduce(
    (sum, booking) => sum + booking.priceAtBooking,
    0
  );
  const expenseInCents = matchingExpenses
    .filter((entry) => entry.entryType === "expense")
    .reduce((sum, entry) => sum + entry.amountInCents, 0);
  const tipInCents = matchingExpenses
    .filter((entry) => entry.entryType === "tip")
    .reduce((sum, entry) => sum + entry.amountInCents, 0);

  return {
    completedCount: completedBookings.length,
    revenueInCents,
    expenseInCents,
    tipInCents,
    netInCents: revenueInCents + tipInCents - expenseInCents,
    rangeLabel: formatRangeLabel(startDate, endDate),
  };
}

export function summarizeAppointmentStatusesForRange(
  bookings: BookingAnalyticsRecord[],
  startDate: Date,
  endDate: Date
) {
  const matching = bookings.filter((booking) => {
    const bookingDate = parseISO(booking.appointmentDate);
    return isWithinInterval(bookingDate, { start: startDate, end: endDate });
  });

  return {
    total: matching.length,
    pending: matching.filter((booking) => booking.status === "pending").length,
    confirmed: matching.filter((booking) => booking.status === "confirmed").length,
    completed: matching.filter((booking) => booking.status === "completed").length,
    cancelled: matching.filter((booking) => booking.status === "cancelled").length,
  };
}

export function buildMonthlyRevenueSeries(
  bookings: BookingAnalyticsRecord[],
  expenses: ExpenseAnalyticsRecord[]
) {
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, index) => ({
    label: format(new Date(year, index, 1), "MMM"),
    netInCents: 0,
    revenueInCents: 0,
    completedCount: 0,
  }));

  for (const booking of bookings) {
    if (!isCompletedBooking(booking.status)) {
      continue;
    }

    const bookingDate = parseISO(booking.appointmentDate);
    if (bookingDate.getFullYear() !== year) {
      continue;
    }

    const month = months[bookingDate.getMonth()];
    month.completedCount += 1;
    month.revenueInCents += booking.priceAtBooking;
    month.netInCents += booking.priceAtBooking;
  }

  for (const entry of expenses) {
    const entryDate = parseISO(entry.entryDate);
    if (entryDate.getFullYear() !== year) {
      continue;
    }

    const month = months[entryDate.getMonth()];
    month.netInCents +=
      entry.entryType === "tip" ? entry.amountInCents : -entry.amountInCents;
  }

  return months;
}

export function buildMonthlyStatusSeries(bookings: BookingAnalyticsRecord[]) {
  const year = new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, index) => ({
    label: format(new Date(year, index, 1), "MMM"),
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  }));

  for (const booking of bookings) {
    const bookingDate = parseISO(booking.appointmentDate);
    if (bookingDate.getFullYear() !== year) {
      continue;
    }

    const month = months[bookingDate.getMonth()];
    month.total += 1;
    month[booking.status] += 1;
  }

  return months;
}
