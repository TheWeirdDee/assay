import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth/dal";
import { ArrowDown, ArrowRight, CheckCircle2, CirclePause, FileCheck2, Landmark, Radar, ShieldCheck, WalletCards } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getUser();
  const appHref = user ? "/app" : "/signup";
  return <div className="min-h-screen bg-[#070a08] text-white selection:bg-lime-300 selection:text-black">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070a08]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/"><Image src="/assay-logo.svg" alt="Assay" width={148} height={36} priority className="h-9 w-auto" /></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-300 md:flex"><a href="#problem" className="hover:text-white">The problem</a><a href="#workflow" className="hover:text-white">How it works</a><a href="#proof" className="hover:text-white">What you get</a><Link href="/docs" className="hover:text-white">Guide</Link></nav>
        <div className="flex items-center gap-4">{!user && <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white">Sign in</Link>}<Link href={appHref} className="rounded-full bg-[#a8d14a] px-5 py-2.5 text-sm font-extrabold text-[#10150b] hover:bg-[#b8e05a]">{user ? "Open workspace" : "Start free sandbox"}</Link></div>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(168,209,74,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(168,209,74,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-6 text-sm font-extrabold uppercase tracking-[.22em] text-[#a8d14a]">Autonomous merchant treasury control</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-.045em] text-white sm:text-6xl lg:text-7xl">Clean money can still be the wrong money to move.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">Cleanverse proves a payment is compliant. <strong className="text-white">Assay decides whether your business should clear it, hold it, or pay it out now</strong>—using your cash position, normal behavior, and counterparty history.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href={appHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a8d14a] px-7 py-4 text-base font-extrabold text-[#10150b] hover:bg-[#b8e05a]">{user ? "Open your workspace" : "Create a sandbox workspace"}<ArrowRight className="h-5 w-5" /></Link><Link href="/docs#getting-started" className="inline-flex items-center justify-center rounded-xl border border-white/20 px-7 py-4 text-base font-bold text-white hover:bg-white/5">See the 5-minute setup</Link></div>
            <p className="mt-4 text-sm text-zinc-400">Real Cleanverse checks · Real Monad testnet transfers · No card or payment required</p>
          </div>

          <div className="relative rounded-[2rem] border border-white/15 bg-[#101411] p-5 shadow-2xl shadow-black/50 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-sm font-bold text-white">Incoming payment</p><p className="mt-1 text-sm text-zinc-400">New customer · 0x71…48A2</p></div><span className="text-3xl font-black text-white">4,000 <small className="text-base text-zinc-400">aUSDC</small></span></div>
            <div className="space-y-5 py-6">
              <Signal icon={<ShieldCheck />} label="Cleanverse compliance" value="Verified and permitted" tone="text-emerald-300" />
              <Signal icon={<Radar />} label="Behavior check" value="40× normal amount · first-time sender" tone="text-amber-300" />
              <Signal icon={<Landmark />} label="Cash position" value="Within current reserve policy" tone="text-zinc-200" />
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5"><div className="flex items-center justify-between"><span className="text-sm font-extrabold uppercase tracking-wider text-amber-300">Assay decision</span><span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-black">REVIEW</span></div><p className="mt-3 text-base leading-7 text-white">The payment is compliant, but unusually large and from a new counterparty. Keep it quarantined until your team confirms it.</p></div>
          </div>
        </div>
      </section>

      <section id="problem" className="border-b border-white/10 bg-[#eef3e8] text-[#11170e]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
          <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#57752b]">The operational gap</p><h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">Compliance tells you what may happen. It does not run your treasury.</h2></div>
          <div className="space-y-8 text-lg leading-8 text-[#394134]"><p>A verified customer can still send an amount wildly outside your normal business pattern. A verified supplier can still be paid at the wrong time and push your reserves below policy. A compliant transfer can still require human review.</p><p className="font-bold text-[#11170e]">Without Assay, a finance operator must watch wallets, compare transactions manually, decide what clears, and reconstruct the reasoning later for auditors.</p><div className="border-l-4 border-[#7ca532] pl-6 text-2xl font-black leading-9">Assay turns those repeated treasury decisions into a controlled, explainable operating loop.</div></div>
        </div>
      </section>

      <section id="workflow" className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <p className="text-sm font-black uppercase tracking-[.2em] text-[#a8d14a]">One clear operating loop</p><h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">From wallet activity to a defensible decision.</h2>
          <div className="mt-14 grid gap-0 lg:grid-cols-4">
            <Step number="01" icon={<WalletCards />} title="Money appears" body="Assay detects a real incoming aUSDC transfer or receives a payout request." />
            <Step number="02" icon={<ShieldCheck />} title="Cleanverse checks it" body="A‑Pass and asset rules determine whether the counterparty is eligible." />
            <Step number="03" icon={<Radar />} title="Assay judges timing" body="Amount, counterparty history, and reserves produce ALLOW, HOLD, or ESCALATE." />
            <Step number="04" icon={<FileCheck2 />} title="Your evidence is ready" body="Decision, compliance result, transaction hash, and report stay linked for review." last />
          </div>
        </div>
      </section>

      <section id="proof" className="bg-[#101411]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#a8d14a]">What changes for the merchant</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A treasury inbox, not another blockchain dashboard.</h2><p className="mt-6 text-lg leading-8 text-zinc-300">Your team sees what needs attention first: finish setup, review an exception, or send an eligible payout. Chain details remain available as evidence—not as the primary interface.</p></div>
          <div className="space-y-4"><Outcome icon={<CheckCircle2 />} title="Clear normal money automatically" body="Routine verified activity becomes cleared working capital." /><Outcome icon={<CirclePause />} title="Quarantine unusual money" body="Compliant but abnormal incoming funds stay visible without silently becoming spendable." /><Outcome icon={<Landmark />} title="Protect operating reserves" body="Payouts that breach your cleared-inflow policy wait for review." /><Outcome icon={<FileCheck2 />} title="Explain every decision" body="Operators and auditors see the rule, signal, decision, and on-chain result together." /></div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:px-8"><ArrowDown className="h-7 w-7 text-[#a8d14a]" /><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Create the workspace. Assay handles the infrastructure.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">Start with a managed Monad sandbox wallet, complete Cleanverse verification, fund test assets, and watch the first real decision arrive.</p><Link href={appHref} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#a8d14a] px-8 py-4 text-base font-extrabold text-[#10150b]">{user ? "Open workspace" : "Start free sandbox"}<ArrowRight className="h-5 w-5" /></Link></div>
      </section>
    </main>
    <footer className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-10 text-sm text-zinc-400 sm:flex-row sm:px-8"><span>Assay · Merchant treasury decisions on Cleanverse rails</span><div className="flex gap-6"><Link href="/docs" className="text-white">Operating guide</Link><span>Monad testnet</span></div></div></footer>
  </div>;
}

function Signal({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <div className="flex items-center gap-4"> <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-[#a8d14a] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-sm text-zinc-400">{label}</p><p className={`mt-1 text-base font-bold ${tone}`}>{value}</p></div></div>; }
function Step({ number, icon, title, body, last }: { number: string; icon: React.ReactNode; title: string; body: string; last?: boolean }) { return <div className={`relative border-white/15 py-7 lg:border-t lg:px-6 ${last ? "" : "lg:border-r"}`}><div className="flex items-center justify-between"><span className="text-sm font-black text-[#a8d14a]">{number}</span><span className="text-zinc-400 [&>svg]:h-6 [&>svg]:w-6">{icon}</span></div><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 text-base leading-7 text-zinc-300">{body}</p></div>; }
function Outcome({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="flex gap-5 border-b border-white/10 pb-5"><span className="mt-1 text-[#a8d14a] [&>svg]:h-6 [&>svg]:w-6">{icon}</span><div><h3 className="text-xl font-black text-white">{title}</h3><p className="mt-2 text-base leading-7 text-zinc-300">{body}</p></div></div>; }
