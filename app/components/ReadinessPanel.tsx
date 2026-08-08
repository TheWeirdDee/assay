import { AlertCircle, CheckCircle2, ExternalLink, WalletCards } from "lucide-react";
import type { MerchantReadiness } from "@/lib/merchants/readiness";

export function ReadinessPanel({ readiness }: { readiness: MerchantReadiness }) {
  const items = [
    { ok: readiness.identity === "ready", label: "Cleanverse identity", value: readiness.identityMessage },
    { ok: readiness.gasReady, label: "Monad gas", value: `${readiness.gasBalance} MON` },
    { ok: readiness.tokenReady, label: "Settlement balance", value: `${readiness.tokenBalance} aUSDC` },
  ];
  const ready = items.every((item) => item.ok);
  return <section className={`rounded-2xl border p-5 ${ready ? "border-emerald-800/50 bg-emerald-950/15" : "border-amber-800/50 bg-amber-950/15"}`}>
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><WalletCards className="h-4 w-4" /><h2 className="text-xs font-bold uppercase tracking-wider">Workspace readiness</h2></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${ready ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{ready ? "Ready" : "Action required"}</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">{items.map((item) => <div key={item.label} className="flex gap-2 rounded-xl border border-white/10 bg-black/10 p-3">{item.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />}<div><p className="text-xs font-semibold">{item.label}</p><p className="mt-1 text-[11px] text-zinc-400">{item.value}</p></div></div>)}</div>
    {!ready && <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-400">{readiness.verificationUrl && <a href={readiness.verificationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-[#84A93C] px-3 py-2 font-bold text-zinc-950">Verify identity <ExternalLink className="h-3.5 w-3.5" /></a>}<span>Fund the displayed wallet with testnet MON and aUSDC to enable settlement.</span></div>}
  </section>;
}
