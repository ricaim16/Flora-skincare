"use client";

type StatusSlice = {
  label: string;
  value: number;
  color: string;
  toneClass: string;
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function buildArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export function StatusPieChart({
  total,
  slices,
  variant = "doughnut",
}: {
  total: number;
  slices: StatusSlice[];
  variant?: "pie" | "doughnut";
}) {
  const visibleSlices = slices.filter((slice) => slice.value > 0);
  const safeTotal = Math.max(
    total,
    visibleSlices.reduce((sum, slice) => sum + slice.value, 0),
    1
  );

  const chartRadius = 92;
  const innerRadius = variant === "doughnut" ? 44 : 0;

  const chartSlices = visibleSlices.reduce<
    Array<
      StatusSlice & {
        degrees: number;
        path: string;
        isFullCircle: boolean;
      }
    >
  >((accumulator, slice, index) => {
    const previousDegrees = accumulator.reduce(
      (sum, currentSlice) => sum + currentSlice.degrees,
      0
    );
    const remainingDegrees = Math.max(360 - previousDegrees, 0);
    const rawDegrees = (slice.value / safeTotal) * 360;
    const degrees =
      index === visibleSlices.length - 1 ? remainingDegrees : rawDegrees;
    const startAngle = previousDegrees;
    const endAngle = previousDegrees + degrees;

    accumulator.push({
      ...slice,
      degrees,
      path: buildArcPath(150, 150, chartRadius, startAngle, endAngle),
      isFullCircle: degrees >= 359.999,
    });

    return accumulator;
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-5">
      <div className="mb-5 flex flex-wrap justify-center gap-4">
        {slices.map((slice) => (
          <div key={slice.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-6 rounded-sm"
              style={{ backgroundColor: slice.color }}
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-slate-600">
              {slice.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <svg
          viewBox="0 0 300 300"
          className="h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] lg:h-[320px] lg:w-[320px]"
          role="img"
          aria-label="Monthly appointment status pie chart"
        >
          <circle cx="150" cy="150" r={chartRadius} fill="#ffffff" stroke="#ffffff" strokeWidth="1.5" />
          {chartSlices.map((slice) => (
            <g key={slice.label}>
              {slice.isFullCircle ? (
                <circle
                  cx="150"
                  cy="150"
                  r={chartRadius}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ) : (
                <path d={slice.path} fill={slice.color} stroke="#ffffff" strokeWidth="2" />
              )}
            </g>
          ))}
          {variant === "doughnut" ? (
            <circle cx="150" cy="150" r={innerRadius} fill="#ffffff" stroke="#ffffff" strokeWidth="2" />
          ) : null}
        </svg>
      </div>

      <div className="mt-2 text-center text-sm font-semibold text-slate-700">
        Total: {total}
      </div>
    </div>
  );
}
