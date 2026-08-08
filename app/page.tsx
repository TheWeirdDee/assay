import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth/dal";
import {
  ArrowRight,
  ShieldCheck,
  Sliders,
  ArrowRightLeft,
  FileText,
  Lock,
  Database,
  ExternalLink,
  BookOpen,
  Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getUser();
  const primaryHref = user ? "/app" : "/signup";
  const primaryLabel = user ? "Go to your merchants" : "Create an account";

  return (
    <div className="flex min-h-screen flex-col bg-[#080B09] text-zinc-100 font-sans antialiased selection:bg-[#84A93C] selection:text-zinc-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-[#84A93C]/10 blur-[150px]" />
      </div>

      <header className="relative z-50 w-full border-b border-zinc-800/60 bg-[#080B09]/80 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/">
              <Image src="/assay-logo.svg" alt="Assay" width={160} height={38} priority className="h-9 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
              <a href="#architecture" className="hover:text-zinc-100 transition-colors">
                Architecture
              </a>
              <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">
                Workflow
              </a>
              <a href="#features" className="hover:text-zinc-100 transition-colors">
                Capabilities
              </a>
              <Link href="/docs" className="hover:text-zinc-100 transition-colors flex items-center gap-1">
                Docs <ExternalLink className="h-3 w-3" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-zinc-100">
                Sign in
              </Link>
            )}
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-xl bg-[#84A93C] px-4.5 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-[#96bc46] shadow-md shadow-[#84A93C]/10 active:scale-95"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 pt-16 pb-12 text-center">
          <div className="flex flex-col items-center gap-6">
            <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-50 leading-[1.12]">
              Cleanverse answers &lsquo;is it allowed?&rsquo;. <br />
              <span className="bg-gradient-to-r from-[#84A93C] via-[#A0C450] to-[#84A93C] bg-clip-text text-transparent">
                Assay answers &lsquo;should it move now?&rsquo;.
              </span>
            </h1>

            <p className="max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              An autonomous treasury operator for on-chain merchants, running on Cleanverse&apos;s verified rails on
              Monad. Cleanverse gates compliance (A-Pass/CCP); Assay decides operational timing, solvency
              sequencing, and anomaly escalation — and settles for real, on-chain.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#84A93C] px-8 py-3.5 text-sm font-bold text-zinc-950 transition-all hover:bg-[#96bc46] hover:shadow-xl hover:shadow-[#84A93C]/20 active:scale-95"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800/80 transition-colors"
            >
              <BookOpen className="h-4 w-4 text-zinc-400" />
              Read Technical Docs
            </Link>
          </div>

          <div className="w-full max-w-4xl pt-8">
            <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-6 text-left shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-4">
                <span className="font-mono text-xs font-semibold text-zinc-400">Example judgment-engine output</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/80 p-4 flex flex-col gap-2">
                  <span className="text-zinc-500 font-sans font-medium text-[11px] uppercase tracking-wider">
                    Inbound Payment Detected On-Chain
                  </span>
                  <div className="flex justify-between items-baseline">
                    <span className="text-zinc-200 font-bold">$4,000.00 A-Token</span>
                    <span className="text-zinc-400">Payer: 0x3C44...93BC</span>
                  </div>
                  <div className="pt-2 text-[11px] font-sans text-emerald-400 flex items-center gap-1.5 border-t border-zinc-800/50">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Cleanverse Compliance: Code 4 (A-Pass Verified)
                  </div>
                </div>

                <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-400 font-sans font-semibold text-[11px] uppercase tracking-wider">
                      Assay Operational Verdict
                    </span>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                      ESCALATE
                    </span>
                  </div>
                  <p className="text-zinc-300 font-sans text-[11px] leading-relaxed">
                    4.0σ size deviation vs learned baseline ($100 avg), AND counterparty first seen today. Exceeds
                    risk tolerance → Escalated to Merchant Inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="architecture" className="w-full border-t border-zinc-800/60 bg-zinc-950/60 py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">The Two Architectural Layers</h2>
              <p className="text-xs text-zinc-400 pt-1">
                Compliance says a transfer is permitted. Assay decides whether it is timely, safe, and wise.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 text-left">
              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-zinc-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cleanverse Rail</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-100">&ldquo;Is it allowed?&rdquo;</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Static compliance pre-flight checks. Enforces A-Pass bank-verified identity credentials, A-Token
                  provenance, Travel Rule data capture, and sanctions restrictions.
                </p>
                <div className="mt-auto pt-4 border-t border-zinc-800/60 text-[11px] font-semibold text-zinc-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-zinc-500" /> Base Protocol Gate (Native)
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-700/80 bg-zinc-900/90 p-6 backdrop-blur-md shadow-xl">
                <div className="flex items-center gap-2">
                  <Image src="/assay-icon.svg" alt="A-Chip" width={22} height={22} className="rounded-md" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#84A93C]">Assay Operator</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-100">&ldquo;Should it move now?&rdquo;</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Autonomous cashflow timing &amp; risk judgment. Evaluates amount anomaly z-score, counterparty
                  history, and solvency reserve rules to ALLOW, HOLD, ESCALATE, or BLOCK — the decision itself is
                  deterministic and auditable; a real LLM call narrates it in plain language.
                </p>
                <div className="mt-auto pt-4 border-t border-zinc-800/60 text-[11px] font-semibold text-[#84A93C] flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#84A93C]" /> Operational Treasury Decision Layer
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full border-t border-zinc-800/60 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">How It Works</h2>
              <p className="text-xs text-zinc-400">Three steps, running for real on Monad testnet.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-zinc-500">01 / DETECTION</span>
                <h3 className="text-base font-bold text-zinc-100">Assay watches the chain</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Inbound A-Token transfers to the merchant&apos;s wallet are detected from real on-chain events, not
                  simulated. Outbound payouts are merchant-initiated.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-zinc-500">02 / COMPLIANCE</span>
                <h3 className="text-base font-bold text-zinc-100">Cleanverse Compliance Gate</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  A-Pass credential status and CCP rules verify identity, sanctions, and Travel Rule safety. A
                  compliance block is final — Assay never overrides it.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-6 shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#84A93C]/40 bg-[#090C0A] text-[#84A93C]">
                  <Sliders className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-[#84A93C]">03 / DECISION</span>
                <h3 className="text-base font-bold text-zinc-100">Assay&apos;s operational verdict</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Multi-signal engine judges timing, solvency, and anomaly score to ALLOW, HOLD, ESCALATE, or BLOCK,
                  with merchant override on escalations.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full border-t border-zinc-800/60 bg-zinc-950/40 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">Product Capabilities</h2>
              <p className="text-xs text-zinc-400 max-w-xl">
                Built for merchants and financial institutions running compliant on-chain cashflow operations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Capability
                icon={<Sliders className="h-5 w-5 text-[#84A93C]" />}
                title="Solvency Reserve Protection"
                body="Automatically holds outbound payouts if committed spending would breach cleared inflow reserves, preventing liquidity deficits."
              />
              <Capability
                icon={<Database className="h-5 w-5 text-[#84A93C]" />}
                title="Learned Baseline Intelligence"
                body="Calculates real-time z-score deviation over historical merchant transaction amounts and tracks known counterparty history, per merchant."
              />
              <Capability
                icon={<ShieldCheck className="h-5 w-5 text-[#84A93C]" />}
                title="Decision Inbox & Escalation"
                body="Anomalous payments (large amount + first-seen counterparty) are surfaced with a real LLM-narrated rationale for merchant sign-off."
              />
              <Capability
                icon={<Lock className="h-5 w-5 text-[#84A93C]" />}
                title="Fail-Closed by Design"
                body="Any transaction failing either Cleanverse compliance OR Assay's own operating policy is held or blocked cleanly — funds never move partially."
              />
              <Capability
                icon={<Download className="h-5 w-5 text-[#84A93C]" />}
                title="Dual Audit Log Exporter"
                body="One-click exportable JSON and CSV audit packages merging Cleanverse CCP proofs with Assay's operational decision rationale."
              />
              <Capability
                icon={<FileText className="h-5 w-5 text-[#84A93C]" />}
                title="Per-Merchant Accounts"
                body="Every merchant is its own tenant with a managed sandbox wallet, operating policy, learned baseline, and private decision log. Assay owns the Cleanverse infrastructure configuration."
              />
            </div>
          </div>
        </section>

        <section className="w-full border-t border-zinc-800/60 bg-zinc-950/60 py-16">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 text-center">
            <h2 className="text-xl font-bold text-zinc-100">On custody</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Assay is not a custodian in the exchange sense — it never takes ownership of merchant funds or trades
              on their behalf. But it is not custody-free either: to act autonomously, each merchant gives Assay a
              signing key, encrypted at rest, scoped to that merchant only, and usable only to submit transfers
              through Cleanverse&apos;s verified rails. That mandate is the mechanism that makes &ldquo;autonomous&rdquo;
              possible — it is disclosed here, not hidden behind marketing language.
            </p>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-zinc-800/80 bg-[#080B09] py-14">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800/60 pb-8">
            <div className="flex flex-col gap-2">
              <Image src="/assay-logo.svg" alt="Assay Logo" width={170} height={40} className="h-9 w-auto opacity-90" />
              <p className="text-xs text-zinc-400 max-w-md">
                An autonomous merchant treasury operator on Cleanverse rails, deployed on Monad testnet.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-xs font-medium text-zinc-400">
              <a href="#architecture" className="hover:text-zinc-100 transition-colors">
                Architecture
              </a>
              <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">
                Workflow
              </a>
              <a href="#features" className="hover:text-zinc-100 transition-colors">
                Capabilities
              </a>
              <Link href="/docs" className="hover:text-zinc-100 transition-colors">
                Docs
              </Link>
              <Link href={primaryHref} className="text-[#84A93C] font-semibold hover:underline">
                {primaryLabel}
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <div>Originally built for Cleanverse Build: Trusted Assets · Monad Foundation</div>
            <div>Cleanverse API v3 · Monad Testnet</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Capability({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200">{icon}</div>
      <h3 className="font-bold text-zinc-100">{title}</h3>
      <p className="text-xs text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}
