"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createMerchantAction, type CreateMerchantState } from "@/app/actions/merchants";
import { AlertTriangle, ArrowRight, Check, Copy, Loader2 } from "lucide-react";

const inputClass = "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-[#84A93C]";

export function NewMerchantForm() {
  const [state, formAction, pending] = useActionState<CreateMerchantState, FormData>(createMerchantAction, undefined);

  if (state?.generatedPrivateKey) {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-amber-800/60 bg-amber-950/20 p-6">
        <div className="flex items-center gap-2 text-amber-400"><AlertTriangle className="h-5 w-5" /><h2 className="text-sm font-bold">Save your sandbox recovery key</h2></div>
        <p className="text-xs leading-relaxed text-zinc-300">Assay created a managed Monad testnet wallet. The key is shown once so you retain recovery control. Never use this sandbox wallet for real assets.</p>
        <Field label="Wallet address" value={state.generatedAddress ?? ""} />
        <Field label="Recovery key" value={state.generatedPrivateKey} sensitive />
        <Link href={`/app/${state.merchantId}`} className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#84A93C] px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-[#96bc46]">
          I saved it — check workspace readiness <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="rounded-xl border border-[#84A93C]/30 bg-[#84A93C]/5 p-4">
        <p className="text-xs font-semibold text-[#9fca4d]">Assay configures the infrastructure for you</p>
        <ul className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
          {["Cleanverse connection", "Monad testnet", "Cleanverse USD (aUSDC)", "Managed sandbox wallet"].map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#84A93C]" />{item}</li>)}
        </ul>
      </div>
      <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-400">Business name<input name="name" required className={inputClass} placeholder="Acme Exports Ltd" /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-400">Operating style<select name="anomalyTolerance" defaultValue="medium" className={inputClass}><option value="low">Cautious</option><option value="medium">Balanced</option><option value="high">Flexible</option></select></label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-zinc-400">Escalation email<input name="escalateTo" type="email" required className={inputClass} placeholder="finance@acme.com" /></label>
      </div>
      <label className="flex items-center gap-2 text-xs text-zinc-300"><input type="checkbox" name="solvencyRule" defaultChecked />Pause payouts that exceed cleared incoming funds</label>
      {state?.error && <p className="text-xs font-medium text-red-400">{state.error}</p>}
      <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#84A93C] px-5 py-3 text-sm font-bold text-zinc-950 hover:bg-[#96bc46] disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}{pending ? "Creating secure workspace…" : "Create workspace"}
      </button>
      <p className="text-center text-[11px] text-zinc-500">Sandbox only. Test assets have no monetary value.</p>
    </form>
  );
}

function Field({ label, value, sensitive }: { label: string; value: string; sensitive?: boolean }) {
  return <div className="flex flex-col gap-1"><span className="text-[11px] font-semibold text-zinc-400">{label}</span><div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200"><span className="flex-1 break-all">{value}</span><button type="button" onClick={() => navigator.clipboard.writeText(value)} aria-label={`Copy ${label}`}><Copy className="h-3.5 w-3.5" /></button></div>{sensitive && <span className="text-[10px] text-amber-500">Store this in a password manager.</span>}</div>;
}
