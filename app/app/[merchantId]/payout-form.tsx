"use client";

import { useActionState } from "react";
import { createPayoutAction, type PayoutState } from "@/app/actions/payments";
import { Send } from "lucide-react";

export function PayoutForm({ merchantId }: { merchantId: string }) {
  const action = createPayoutAction.bind(null, merchantId);
  const [state, formAction, pending] = useActionState<PayoutState, FormData>(action, undefined);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm">
      <div className="flex items-center gap-2">
        <Send className="h-4 w-4 text-zinc-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
          New Payout
        </h3>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Submitted through the judgment engine, then Cleanverse compliance, then real settlement — in that order.
      </p>
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="counterparty" className="text-[11px] font-semibold text-zinc-500">
            Counterparty address
          </label>
          <input
            id="counterparty"
            name="counterparty"
            required
            placeholder="0x…"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div className="flex w-32 flex-col gap-1.5">
          <label htmlFor="amount" className="text-[11px] font-semibold text-zinc-500">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Judging…" : "Send"}
        </button>
      </form>
      {state?.error && <p className="text-xs font-medium text-red-500">{state.error}</p>}
      {state?.result && <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{state.result}</p>}
    </div>
  );
}
