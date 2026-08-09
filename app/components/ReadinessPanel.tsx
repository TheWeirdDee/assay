import { AlertCircle, CheckCircle2, ExternalLink, WalletCards } from "lucide-react";
import type { MerchantReadiness } from "@/lib/merchants/readiness";
import { VerifyIdentityButton } from "./VerifyIdentityButton";

export function ReadinessPanel({ readiness, merchantId, walletAddress }: { readiness: MerchantReadiness; merchantId: string; walletAddress: string }) {
  const items = [
    { ok: readiness.identity === "ready", label: "Cleanverse identity", value: readiness.identityMessage },
    { ok: readiness.gasReady, label: "Monad gas", value: `${readiness.gasBalance} MON` },
    { ok: readiness.tokenReady, label: "Settlement balance", value: `${readiness.tokenBalance} aUSDC` },
  ];
  const ready = items.every((item) => item.ok);
  return <section className={`rounded-2xl border p-5 ${ready ? "border-emerald-800/50 bg-emerald-950/15" : "border-amber-800/50 bg-amber-950/15"}`}>
    <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><WalletCards className="h-5 w-5" /><h2 className="text-sm font-bold uppercase tracking-wider">Workspace readiness</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${ready ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{ready ? "Ready" : "Action required"}</span></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">{items.map((item) => <div key={item.label} className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4">{item.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />}<div><p className="text-sm font-semibold text-white">{item.label}</p><p className="mt-1 text-sm text-zinc-300">{item.value}</p></div></div>)}</div>
    {!ready && <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm text-zinc-300">
      {readiness.identity !== "ready" && <VerifyIdentityButton merchantId={merchantId} />}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-black/20 p-4"><p className="font-bold text-white">1. Get Monad testnet MON</p><p className="mt-2 leading-6">Send MON directly to the workspace wallet:</p><p className="mt-2 break-all font-mono text-xs text-zinc-200">{walletAddress}</p><a href="https://faucet.monad.xyz/" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-bold text-[#a8d14a] hover:underline">Open Monad faucet<ExternalLink className="h-4 w-4" /></a></div>
        <div className="rounded-xl bg-black/20 p-4"><p className="font-bold text-white">2. Get Circle USDC, which becomes aUSDC</p><p className="mt-2 leading-6">Choose <strong>USDC</strong> and <strong>Monad Testnet</strong>. Send to this Cleanverse deposit address, not the workspace wallet:</p><p className="mt-2 break-all font-mono text-xs text-zinc-200">{readiness.depositAddress ?? "Deposit address temporarily unavailable"}</p><a href="https://faucet.circle.com/?allow=true" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-bold text-[#a8d14a] hover:underline">Open Circle USDC faucet<ExternalLink className="h-4 w-4" /></a></div>
      </div>
      <p className="text-xs leading-5 text-zinc-400">After Circle confirms the request, wait for Cleanverse to convert the deposited USDC into aUSDC, then refresh this page.</p>
    </div>}
  </section>;
}
