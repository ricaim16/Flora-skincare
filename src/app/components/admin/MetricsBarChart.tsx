"use client";

type Series = {
  key: string;
  label: string;
  colorClass: string;
};

type DataPoint = {
  label: string;
  [key: string]: number | string;
};

export function MetricsBarChart({
  title,
  subtitle,
  data,
  series,
}: {
  title: string;
  subtitle: string;
  data: DataPoint[];
  series: Series[];
}) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) =>
      series.map((entry) => Number(item[entry.key] || 0))
    )
  );

  return (
    <div className="rounded-[1.8rem] border border-purple-100 bg-white/85 p-6 shadow-[0_22px_44px_rgba(72,29,116,0.08)]">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-purple-950">{title}</h3>
          <p className="mt-1 text-sm text-purple-600">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-purple-600">
          {series.map((entry) => (
            <div key={entry.key} className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${entry.colorClass}`} />
              {entry.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 xl:grid-cols-6">
        {data.map((item) => (
          <div key={String(item.label)} className="flex flex-col items-center gap-3">
            <div className="flex h-56 items-end gap-1">
              {series.map((entry) => (
                <div
                  key={entry.key}
                  className={`w-4 rounded-full ${entry.colorClass}`}
                  style={{
                    height: `${Math.max(
                      (Number(item[entry.key] || 0) / maxValue) * 100,
                      Number(item[entry.key] || 0) > 0 ? 6 : 0
                    )}%`,
                  }}
                  title={`${entry.label}: ${item[entry.key]}`}
                />
              ))}
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-purple-950">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
