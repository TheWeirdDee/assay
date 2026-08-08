"use client";

interface SolvencyGaugeProps {
  clearedInflows: bigint;
  committedOutflows: bigint;
}

export function SolvencyGauge({ clearedInflows, committedOutflows }: SolvencyGaugeProps) {
  const inflows = Number(clearedInflows);
  const outflows = Number(committedOutflows);
  const ratio = outflows > 0 ? (inflows / outflows).toFixed(2) : "∞";

  const percentUsed = inflows > 0 ? Math.min(100, Math.round((outflows / inflows) * 100)) : 0;

  let statusColor = "bg-emerald-500 text-emerald-700 dark:text-emerald-400";
  let statusBadge = "HEALTHY";
  if (percentUsed >= 80 && percentUsed < 100) {
    statusColor = "bg-amber-500 text-amber-700 dark:text-amber-400";
    statusBadge = "CAUTION";
  } else if (percentUsed >= 100) {
    statusColor = "bg-red-500 text-red-700 dark:text-red-400";
    statusBadge = "SOLVENCY BREACH";
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Solvency Coverage &amp; Reserve Ratio
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider ${statusColor} bg-opacity-15`}>
          {statusBadge}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-50">
            {ratio}x
          </span>
          <span className="text-xs text-zinc-500">Coverage Ratio</span>
        </div>
        <div className="text-right text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          ${outflows.toLocaleString()} spent / ${inflows.toLocaleString()} cleared
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${
              percentUsed >= 100 ? "bg-red-500" : percentUsed >= 80 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${Math.max(4, percentUsed)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-medium text-zinc-400">
          <span>0% Committed</span>
          <span>{percentUsed}% Solvency Utilized</span>
          <span>100% Reserve Limit</span>
        </div>
      </div>
    </div>
  );
}
