"use client";

import { Brain } from "lucide-react";

interface BaselineData {
  amountMean: number;
  amountStd: number;
  knownCounterparties: string[];
  clearedInflows: string;
  committedOutflows: string;
}

export function LearnedBaselinePanel({ baseline }: { baseline: BaselineData }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-zinc-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
            Learned Merchant Baseline &amp; Feedback State
          </span>
        </div>
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
          ADAPTIVE LEARNING ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-950/50">
          <span className="text-[11px] font-medium text-zinc-500">Historical Mean</span>
          <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            ${baseline.amountMean.toFixed(0)} <span className="text-xs text-zinc-400">avg</span>
          </span>
        </div>

        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-950/50">
          <span className="text-[11px] font-medium text-zinc-500">Std Deviation (σ)</span>
          <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            ±${baseline.amountStd.toFixed(0)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-950/50">
          <span className="text-[11px] font-medium text-zinc-500">Trusted Parties</span>
          <span className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {baseline.knownCounterparties.length} verified
          </span>
        </div>
      </div>

      {baseline.knownCounterparties.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400 self-center mr-1">Learned Trusted Addresses:</span>
          {baseline.knownCounterparties.map((addr) => (
            <span
              key={addr}
              className="rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {addr.slice(0, 6)}...{addr.slice(-4)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
