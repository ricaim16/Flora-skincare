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
    <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-purple-950">Monthly performance</h3>
          <p className="mt-1 text-sm text-purple-600">
            Revenue and total bookings for each month this year.
          </p>
        </div>
        <div className="flex gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            Bookings
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 md:grid-cols-12">
        {data.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-3">
            <div className="flex h-56 items-end gap-2">
              <div
                className="w-4 rounded-full bg-gradient-to-t from-purple-700 to-fuchsia-400"
                style={{
                  height: `${Math.max((item.revenueInCents / maxRevenue) * 100, 8)}%`,
                }}
                title={`${(item.revenueInCents / 100).toLocaleString()} ETB`}
              />
              <div
                className="w-4 rounded-full bg-gradient-to-t from-rose-500 to-orange-300"
                style={{
                  height: `${Math.max((item.bookingsCount / maxBookings) * 100, 8)}%`,
                }}
                title={`${item.bookingsCount} bookings`}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-purple-950">{item.label}</div>
              <div className="text-xs text-purple-500">{item.bookingsCount} bookings</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
