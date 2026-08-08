import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Scale,
  Building,
  Terminal,
  Download,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080B09] text-zinc-100 font-sans antialiased selection:bg-[#84A93C] selection:text-zinc-950">
      {/* Navbar */}
      <header className="relative z-50 w-full border-b border-zinc-800/60 bg-[#080B09]/80 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <Image
                src="/assay-logo.svg"
                alt="Assay Logo"
                width={150}
                height={36}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <span className="hidden sm:inline-block h-4 w-[1px] bg-zinc-800" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <BookOpen className="h-3.5 w-3.5 text-[#84A93C]" /> Technical Documentation
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Overview
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-[#84A93C] px-4 py-2 text-xs font-bold text-zinc-950 transition-all hover:bg-[#96bc46] shadow-sm"
            >
              Go to app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Docs Body */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-10 px-6 py-12">
        {/* Sidebar Nav */}
        <aside className="hidden lg:flex w-64 flex-col gap-6 sticky top-24 h-fit text-xs">
          <div className="flex flex-col gap-1">
            <span className="font-bold uppercase tracking-wider text-zinc-500 text-[10px] pb-1">Specification</span>
            <a href="#overview" className="rounded-lg px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-[#84A93C] transition-colors">
              1. System Overview
            </a>
            <a href="#strip-test" className="rounded-lg px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-[#84A93C] transition-colors">
              2. Architecture &amp; Strip Test
            </a>
            <a href="#primitives" className="rounded-lg px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-[#84A93C] transition-colors">
              3. Cleanverse Native Primitives
            </a>
            <a href="#judgment-engine" className="rounded-lg px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-[#84A93C] transition-colors">
              4. Scoring &amp; Decision Engine
            </a>
            <a href="#institutional" className="rounded-lg px-3 py-2 font-medium text-zinc-300 hover:bg-zinc-900 hover:text-[#84A93C] transition-colors">
              5. Institutional Implementation
            </a>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-2">
            <span className="font-semibold text-zinc-200">Export Dual Audit Logs</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Download combined CCP compliance proofs + Assay operational decision rationale.
            </p>
            <a
              href="/api/export-log?format=json"
              download="assay-audit-log.json"
              className="mt-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors text-xs"
            >
              <Download className="h-3 w-3" /> Download JSON Pack
            </a>
          </div>
        </aside>

        {/* Main Content Column */}
        <main className="flex flex-1 flex-col gap-12 text-sm">
          {/* Section 1: Overview */}
          <section id="overview" className="flex flex-col gap-4 border-b border-zinc-800/80 pb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400 w-fit">
              <Terminal className="h-3.5 w-3.5 text-[#84A93C]" /> Technical Architecture Specification
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50 sm:text-4xl">
              Assay — Technical Architecture
            </h1>
            <p className="text-zinc-400 leading-relaxed text-base">
              Assay makes the operational decisions a compliance rail never makes: <strong className="text-zinc-200">when to pay, whether to hold, how to sequence, and when to escalate</strong>. Every decision is executed strictly through Cleanverse&apos;s verified compliance rails on Monad testnet.
            </p>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-md">
              <span className="text-xs font-bold uppercase tracking-wider text-[#84A93C]">Core Product Thesis</span>
              <p className="text-xl font-bold text-zinc-100 pt-1">
                &ldquo;Cleanverse answers &lsquo;is it allowed?&rsquo;. Assay answers &lsquo;should it move now?&rsquo;.&rdquo;
              </p>
            </div>
          </section>

          {/* Section 2: Anti-Wrapper Proof */}
          <section id="strip-test" className="flex flex-col gap-4 border-b border-zinc-800/80 pb-10">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#84A93C]" />
              Architecture &amp; Anti-Wrapper Strip Test
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Assay is an operational decision layer on top of Cleanverse primitives, not a re-skin of compliance:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-2">
                <span className="font-bold text-zinc-200">Strip Cleanverse Out</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Assay continues to calculate z-scores, check solvency reserves, sequence payments, and escalate anomalies—it simply loses the on-chain compliance guarantee.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-2">
                <span className="font-bold text-zinc-200">Strip Assay Out</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  You are left with native Cleanverse: compliant transfers operated manually by a human treasurer without automated cashflow timing or solvency rules.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Cleanverse Native Integration */}
          <section id="primitives" className="flex flex-col gap-4 border-b border-zinc-800/80 pb-10">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#84A93C]" />
              Cleanverse Native Primitives Integration
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Assay composes Cleanverse v3 REST APIs and Monad smart contracts into an automated money loop:
            </p>
            <ul className="flex flex-col gap-3 font-mono text-xs">
              <li className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-col gap-1">
                <span className="font-bold text-zinc-200 font-sans">A-Pass (CVI — Cleanverse Verified Identity)</span>
                <span className="text-zinc-400 font-sans text-xs">
                  Mandatory pre-flight identity check (`/verify_apass`). Non-transferable identity token bound to verified wallets.
                </span>
              </li>
              <li className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-col gap-1">
                <span className="font-bold text-zinc-200 font-sans">A-Token (CVA — Cleanverse Verified Assets)</span>
                <span className="text-zinc-400 font-sans text-xs">
                  Native settlement wrapper on Monad testnet. Only transferable between A-Pass verified addresses.
                </span>
              </li>
              <li className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 flex flex-col gap-1">
                <span className="font-bold text-zinc-200 font-sans">CCP Protocol &amp; Travel Rule Audit Reports</span>
                <span className="text-zinc-400 font-sans text-xs">
                  Autonomous pre-transaction compliance evaluation + disclosable audit report generation via `/download_travel_rule`.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 4: Judgment Engine */}
          <section id="judgment-engine" className="flex flex-col gap-4 border-b border-zinc-800/80 pb-10">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#84A93C]" />
              Multi-Signal Judgment Engine
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Assay evaluates three deterministic signals in context to produce an operational verdict (ALLOW, HOLD, ESCALATE, BLOCK):
            </p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto">
              <div>z_score = (payment_amount - merchant_mean) / merchant_std</div>
              <div>cp_risk = is_known_counterparty(from_address) ? 0.0 : 1.0</div>
              <div>solvency_breach = (committed_outflows + payment_amount) &gt; cleared_inflows</div>
              <div className="pt-2 text-[#84A93C]"># Decision Logic: Combination over single thresholds</div>
              <div>if (solvency_breach) return HOLD; // Protect reserve balance</div>
              <div>if (z_score &gt;= tolerance &amp;&amp; cp_risk == 1.0) return ESCALATE; // Large &amp; new party</div>
              <div>if (z_score &gt;= tolerance &amp;&amp; cp_risk == 0.0) return ALLOW; // Large size from trusted party</div>
            </div>
          </section>

          {/* Section 5: Institutional Implementation */}
          <section id="institutional" className="flex flex-col gap-4 pb-6">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Building className="h-5 w-5 text-[#84A93C]" />
              Institutional Implementation &amp; Merchant Readiness
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Assay operates strictly as a software management layer on top of licensed rails (matching Cleanverse positioning) — it never takes ownership of merchant funds or trades on their behalf. It does hold a signing key per merchant, encrypted at rest and scoped to that merchant&apos;s Cleanverse-verified transfer path only, which is what makes autonomous settlement possible; that mandate, not custody, is the trust model. A merchant or PSP can run Assay in shadow-mode day one, benefiting from automated solvency controls and dual disclosable audit reports.
            </p>
            <div className="pt-4">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-xl bg-[#84A93C] px-6 py-3 text-xs font-bold text-zinc-950 transition-all hover:bg-[#96bc46]"
              >
                Connect a merchant <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800/80 bg-[#080B09] py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-6 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Image src="/assay-logo.svg" alt="Assay Logo" width={120} height={28} className="h-7 w-auto opacity-80" />
            <span>— Technical Documentation</span>
          </div>
          <div>Cleanverse Build: Trusted Assets Hackathon · Monad Testnet</div>
        </div>
      </footer>
    </div>
  );
}
