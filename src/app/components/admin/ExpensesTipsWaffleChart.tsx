"use client";

type ExpensesTipsWaffleChartProps = {
  expensesInCents: number;
  tipsInCents: number;
};

const CELL_COUNT = 30;

export function ExpensesTipsWaffleChart({
  expensesInCents,
  tipsInCents,
}: ExpensesTipsWaffleChartProps) {
  const total = Math.max(expensesInCents + tipsInCents, 1);
  const expenseCells = Math.min(
    CELL_COUNT,
    Math.round((expensesInCents / total) * CELL_COUNT)
  );
  const tipCells = Math.min(CELL_COUNT - expenseCells, CELL_COUNT);

  const cells = Array.from({ length: CELL_COUNT }, (_, index) => {
    if (index < expenseCells) {
      return "expense";
    }

    if (index < expenseCells + tipCells) {
      return "tip";
    }

    return "empty";
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="grid grid-cols-6 gap-2">
            {cells.map((cell, index) => (
              <span
                key={index}
                className={
                  cell === "expense"
                    ? "h-6 rounded-sm bg-rose-500"
                    : cell === "tip"
                      ? "h-6 rounded-sm bg-amber-400"
                      : "h-6 rounded-sm bg-slate-100"
                }
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-6 rounded-sm bg-rose-500" />
              Expenses
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-6 rounded-sm bg-amber-400" />
              Tips
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-lg bg-rose-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-rose-600">
              Expenses
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {(expensesInCents / 100).toLocaleString()} ETB
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 px-4 py-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Tips
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {(tipsInCents / 100).toLocaleString()} ETB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
