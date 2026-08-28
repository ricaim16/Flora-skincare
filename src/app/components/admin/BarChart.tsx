"use client";

type BarChartPoint = {
  label: string;
  revenueInCents: number;
  bookingsCount: number;
};

export function BarChart({ data }: { data: BarChartPoint[] }) {
  const maxRevenue = Math.max(...data.map((item) => item.revenueInCents), 1);
  const maxBookings = Math.max(...data.map((item) => item.bookingsCount), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Monthly performance</h3>
          <p className="mt-1 text-sm text-slate-500">
            Revenue and total bookings for each month this year.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Bookings
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 md:grid-cols-12">
        {data.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-3">
            <div className="flex h-56 items-end gap-2">
              <div
                className="w-3 rounded-sm bg-purple-600"
                style={{
                  height: `${Math.max((item.revenueInCents / maxRevenue) * 100, 8)}%`,
                }}
                title={`${(item.revenueInCents / 100).toLocaleString()} ETB`}
              />
              <div
                className="w-3 rounded-sm bg-rose-500"
                style={{
                  height: `${Math.max((item.bookingsCount / maxBookings) * 100, 8)}%`,
                }}
                title={`${item.bookingsCount} bookings`}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-slate-900">{item.label}</div>
              <div className="text-xs text-slate-500">{item.bookingsCount} bookings</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
