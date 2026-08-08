"use client";

import { useActionState } from "react";
import { createPayoutAction, type PayoutState } from "@/app/actions/payments";
import { Send } from "lucide-react";

export function PayoutForm({ merchantId }: { merchantId: string }) {
  const [state, formAction, pending] = useActionState<PayoutState, FormData>(createPayoutAction.bind(null, merchantId), undefined);
  const input = "rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-[#a8d14a]";
  return <div className="flex flex-col gap-4 rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
    <div className="flex items-center gap-2"><Send className="h-5 w-5 text-[#a8d14a]" /><h3 className="text-sm font-bold uppercase tracking-wider text-white">Pay a supplier</h3></div>
    <p className="text-sm leading-6 text-zinc-300">Enter who you want to pay. Assay checks your reserve policy first, then Cleanverse eligibility, before anything moves.</p>
    <form action={formAction} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col gap-2 text-sm font-semibold text-zinc-300">Recipient wallet<input name="counterparty" required placeholder="0x…" className={`${input} font-mono`} /></label>
      <label className="flex w-36 flex-col gap-2 text-sm font-semibold text-zinc-300">Amount<input name="amount" type="number" step="0.01" min="0" required className={input} /></label>
      <button type="submit" disabled={pending} className="rounded-lg bg-[#a8d14a] px-5 py-3 text-sm font-extrabold text-zinc-950 hover:bg-[#b8e05a] disabled:opacity-60">{pending ? "Checking…" : "Review payout"}</button>
    </form>
    {state?.error && <p className="text-sm font-medium text-red-400">{state.error}</p>}{state?.result && <p className="text-sm font-medium text-zinc-200">{state.result}</p>}
  </div>;
}
