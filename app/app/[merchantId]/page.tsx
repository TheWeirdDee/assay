import Image from "next/image";
import Link from "next/link";
import { approveDecisionAction, rejectDecisionAction } from "@/app/actions/payments";
import { ExportButton } from "@/app/components/ExportButton";
import { LearnedBaselinePanel } from "@/app/components/LearnedBaselinePanel";
import { SolvencyGauge } from "@/app/components/SolvencyGauge";
import { ReadinessPanel } from "@/app/components/ReadinessPanel";
import { PayoutForm } from "./payout-form";
import { SyncInboundButton } from "./sync-inbound-button";
import { requireMerchant } from "@/lib/auth/dal";
import { loadBaseline } from "@/lib/baseline/store";
import { summarizeLedger } from "@/lib/log/aggregate";
import { listDecisions } from "@/lib/log/store";
import { getMerchantReadiness } from "@/lib/merchants/readiness";
import type { DecisionLogEntry } from "@/lib/log/types";
import { ArrowLeft, CheckCircle2, CircleDot, ShieldCheck, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

function shortAddr(addr: string): string {
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

function decisionBadgeClass(decision: DecisionLogEntry["verdict"]["decision"]): string {
  switch (decision) {
    case "ALLOW":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800";
    case "HOLD":
    case "ESCALATE":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800";
  }
}

function outcomeLabel(entry: DecisionLogEntry): string {
  if (entry.resolution === "approved") return entry.payment.direction === "in"
    ? "Approved by merchant — cleared in ledger"
    : "Approved by merchant — settled on-chain";
  if (entry.resolution === "rejected") return "Rejected by merchant";
  switch (entry.outcome) {
    case "settled":
      return "Settled on-chain";
    case "held_by_judgment":
      return entry.payment.direction === "in"
        ? `${entry.verdict.decision === "ESCALATE" ? "Escalated" : "Held"} — funds already arrived on-chain (no escrow); this is a ledger status, not a block`
        : entry.verdict.decision === "ESCALATE"
          ? "Escalated to merchant"
          : "Held";
    case "blocked_by_compliance":
      return "Blocked by compliance";
  }
}

function StatTile({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${tone ?? "text-zinc-900 dark:text-zinc-50"}`}>{value}</span>
    </div>
  );
}

export default async function MerchantDashboardPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  const { merchant } = await requireMerchant(merchantId);

  const [entries, baseline, readiness] = await Promise.all([
    listDecisions(merchantId),
    loadBaseline(merchantId),
    getMerchantReadiness(merchant),
  ]);
  const sorted = [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const summary = summarizeLedger(entries);
  const inbox = sorted.filter((e) => e.outcome === "held_by_judgment" && !e.resolution);
  const complianceChecked = sorted.filter((e) => e.complianceCode !== undefined);

  const serializedBaseline = {
    amountMean: baseline.amountMean,
    amountStd: baseline.amountStd,
    knownCounterparties: [...baseline.knownCounterparties],
    clearedInflows: baseline.clearedInflows.toString(),
    committedOutflows: baseline.committedOutflows.toString(),
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50/60 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-9 px-5 py-10 sm:px-8">
        <header className="flex flex-col gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              All merchants
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/app/${merchantId}/settings`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Settings className="h-3.5 w-3.5" /> Policy
              </Link>
              <ExportButton merchantId={merchantId} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/assay-icon.svg" alt="Assay A-Chip Mark" width={40} height={40} className="rounded-xl shadow-sm" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">{merchant.name}</h1>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    Monad Testnet
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{merchant.merchant_wallet_address}</p>
              </div>
            </div>
          </div>
        </header>

        <ReadinessPanel readiness={readiness} />

        <section className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
          <div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr]">
            <div><p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a8d14a]">Start here</p><h2 className="mt-3 text-2xl font-black text-white">{readiness.identity !== "ready" ? "Finish activating this workspace" : !readiness.gasReady || !readiness.tokenReady ? "Fund the sandbox wallet" : "Your treasury operator is ready"}</h2><p className="mt-3 text-base leading-7 text-zinc-300">{readiness.identity !== "ready" ? "Assay cannot evaluate or settle verified money until this wallet receives its Cleanverse identity." : !readiness.gasReady || !readiness.tokenReady ? "The identity is ready. Add testnet gas and settlement tokens before attempting a payout." : "Send a small incoming transfer or create a payout. Assay will judge it and show any exception in the review queue."}</p></div>
            <ol className="grid gap-3 sm:grid-cols-3">
              <GuideStep done={readiness.identity === "ready"} number="1" title="Verify identity" body="Activate the wallet with Cleanverse." />
              <GuideStep done={readiness.gasReady && readiness.tokenReady} number="2" title="Add test funds" body="Fund MON gas and sandbox aUSDC." />
              <GuideStep done={entries.length > 0} number="3" title="Run first payment" body="Receive or send a small test transfer." />
            </ol>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PayoutForm merchantId={merchantId} />
          <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-5 dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Inbound Payments
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Assay watches this wallet&apos;s A-Token balance for real transfers and judges each one as it
              arrives. Sync now, or wait for the next scheduled check.
            </p>
            <SyncInboundButton merchantId={merchantId} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SolvencyGauge clearedInflows={baseline.clearedInflows} committedOutflows={baseline.committedOutflows} />
          <LearnedBaselinePanel baseline={serializedBaseline} />
        </section>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Settled Payments" value={summary.settledCount} tone="text-emerald-600 dark:text-emerald-400" />
          <StatTile label="Held Operational" value={summary.heldCount} tone="text-amber-600 dark:text-amber-400" />
          <StatTile label="Escalated Inbox" value={summary.escalatedCount} tone="text-amber-600 dark:text-amber-400" />
          <StatTile
            label="Blocked Compliance"
            value={summary.blockedByComplianceCount}
            tone="text-red-600 dark:text-red-400"
          />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              Decision Inbox
              {inbox.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950">
                  {inbox.length}
                </span>
              )}
            </h2>
          </div>

          {inbox.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 flex flex-col items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-zinc-400" />
              <span>Decision inbox zero. Every transaction has been autonomously settled or blocked at compliance.</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {inbox.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/30 p-5 backdrop-blur-md dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-mono text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      <span>Counterparty: {shortAddr(e.payment.from)}</span>
                      <span className="text-xs text-zinc-400 font-sans">(${e.payment.amount})</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${decisionBadgeClass(e.verdict.decision)}`}>
                      {e.verdict.decision}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white/70 dark:bg-zinc-900/60 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                    {e.verdict.llmSummary || e.verdict.rationale}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-zinc-400">{new Date(e.timestamp).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <form action={rejectDecisionAction.bind(null, merchantId, e.id)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        >
                          Reject Payment
                        </button>
                      </form>
                      <form action={approveDecisionAction.bind(null, merchantId, e.id)}>
                        <button
                          type="submit"
                          className="rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white shadow-sm transition-colors"
                        >
                          Approve &amp; Settle
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Operational Decision Log
          </h2>

          {sorted.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              No decisions recorded yet. Send a payout above, or sync inbound transfers, to see the engine work.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70 shadow-sm">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-zinc-200/80 text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Time</th>
                    <th className="px-4 py-3 font-semibold">Counterparty</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Decision</th>
                    <th className="px-4 py-3 font-semibold">Outcome</th>
                    <th className="px-4 py-3 font-semibold">Operational Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {sorted.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {shortAddr(e.payment.from)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        ${e.payment.amount}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${decisionBadgeClass(e.verdict.decision)}`}>
                          {e.verdict.decision}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-zinc-700 dark:text-zinc-300">{outcomeLabel(e)}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {e.verdict.llmSummary || e.verdict.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
            Cleanverse Compliance Panel (A-Pass / CCP)
          </h2>
          {complianceChecked.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              No transfers have reached the Cleanverse compliance pre-flight check yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/70 shadow-sm">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="border-b border-zinc-200/80 text-[11px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Counterparty</th>
                    <th className="px-4 py-3 font-semibold">verify_apass Code</th>
                    <th className="px-4 py-3 font-semibold">Cleanverse Status</th>
                    <th className="px-4 py-3 font-semibold">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {complianceChecked.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                        {shortAddr(e.payment.from)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            e.complianceCode === 4
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          Code {e.complianceCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{e.complianceMessage}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">{e.txHash || e.resolvedTxHash ? shortAddr((e.txHash ?? e.resolvedTxHash) as string) : "—"}{e.auditReportUrl && <a href={e.auditReportUrl} target="_blank" rel="noreferrer" className="font-sans font-semibold text-[#84A93C] hover:underline">Report</a>}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function GuideStep({ done, number, title, body }: { done: boolean; number: string; title: string; body: string }) {
  return <li className={`rounded-xl border p-4 ${done ? "border-emerald-800 bg-emerald-950/30" : "border-zinc-700 bg-zinc-950/50"}`}><div className="flex items-center gap-2">{done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <CircleDot className="h-5 w-5 text-[#a8d14a]" />}<span className="text-sm font-bold text-white">Step {number}</span></div><h3 className="mt-4 text-base font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p></li>;
}
