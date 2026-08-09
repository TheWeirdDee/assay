import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth/dal";
import { ArrowDown, ArrowRight, CheckCircle2, CirclePause, ExternalLink, FileCheck2, Landmark, Radar, ShieldCheck, WalletCards } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getUser();
  const appHref = user ? "/app" : "/signup";
  const primaryLabel = user ? "Open workspace" : "Create workspace";
  return <div className="min-h-screen bg-[#070a08] text-white selection:bg-lime-300 selection:text-black [&>footer:first-of-type]:hidden">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070a08]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/"><Image src="/assay-logo.svg" alt="Assay" width={148} height={36} priority className="h-9 w-auto" /></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-zinc-300 md:flex"><a href="#the-problem" className="hover:text-white">The problem</a><a href="#how-it-works" className="hover:text-white">How it works</a><a href="#what-you-get" className="hover:text-white">What you get</a><a href="#guide" className="hover:text-white">Guide</a></nav>
        <div className="flex items-center gap-4">{!user && <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white">Sign in</Link>}<PageCta href={appHref} label={primaryLabel} /></div>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(168,209,74,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(168,209,74,.08)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <p className="mb-6 text-sm font-extrabold uppercase tracking-[.22em] text-[#a8d14a]">Scheduled merchant treasury control</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-[-.045em] text-white sm:text-6xl lg:text-7xl">Clean money can still be the wrong money to move.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">Cleanverse proves a payment is compliant. <strong className="text-white">Assay decides whether your business should clear it, hold it, or pay it out now</strong>—using your cash position, normal behavior, and counterparty history.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><PageCta href={appHref} label={primaryLabel} /><PageCta href="#guide" label="See the 5-minute setup" variant="secondary" /></div>
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

      <section id="the-problem" className="scroll-mt-24 border-b border-white/10 bg-[#eef3e8] text-[#11170e]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-28">
          <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#57752b]">The operational gap</p><h2 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">Compliance tells you what may happen. It does not run your treasury.</h2></div>
          <div className="space-y-8 text-lg leading-8 text-[#394134]"><p>A verified customer can still send an amount wildly outside your normal business pattern. A verified supplier can still be paid at the wrong time and push your reserves below policy. A compliant transfer can still require human review.</p><p className="font-bold text-[#11170e]">Without Assay, a finance operator must watch wallets, compare transactions manually, decide what clears, and reconstruct the reasoning later for auditors.</p><div className="border-l-4 border-[#7ca532] pl-6 text-2xl font-black leading-9">Assay turns those repeated treasury decisions into a controlled, explainable operating loop.</div></div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 border-b border-white/10">
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

      <section id="what-you-get" className="scroll-mt-24 bg-[#101411]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
          <div><p className="text-sm font-black uppercase tracking-[.2em] text-[#a8d14a]">What changes for the merchant</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A treasury inbox, not another blockchain dashboard.</h2><p className="mt-6 text-lg leading-8 text-zinc-300">Your team sees what needs attention first: finish setup, review an exception, or send an eligible payout. Chain details remain available as evidence—not as the primary interface.</p></div>
          <div className="space-y-4"><Outcome icon={<CheckCircle2 />} title="Clear normal money automatically" body="Routine verified activity becomes cleared working capital." /><Outcome icon={<CirclePause />} title="Quarantine unusual money" body="Compliant but abnormal incoming funds stay visible without silently becoming spendable." /><Outcome icon={<Landmark />} title="Protect operating reserves" body="Payouts that breach your cleared-inflow policy wait for review." /><Outcome icon={<FileCheck2 />} title="Explain every decision" body="Operators and auditors see the rule, signal, decision, and on-chain result together." /></div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b0f0c]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24"><p className="text-sm font-black uppercase tracking-[.2em] text-[#a8d14a]">Why Cleanverse is essential</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Trust is enforced at every settlement boundary.</h2><div className="mt-12 grid gap-8 md:grid-cols-3"><Essential label="CVI" title="Verified identity" body="Cleanverse A-Pass identity verification gates every counterparty before an outbound transfer can proceed." /><Essential label="CVA" title="Verified assets" body="Cleanverse aUSDC is the only settlement asset Assay moves on Monad testnet." /><Essential label="CCP" title="Compliance evidence" body="Cleanverse performs the pre-transaction eligibility check and Assay requests the real report after each confirmed outbound settlement." /></div></div>
      </section>

      <section id="guide" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-20 text-center sm:px-8"><ArrowDown className="h-7 w-7 text-[#a8d14a]" /><h2 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Create the workspace. Assay handles the infrastructure.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">Start with a managed Monad sandbox wallet, complete Cleanverse verification, fund test assets, and watch the first real decision arrive. Read the operating guide for the complete five-minute setup.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><PageCta href={appHref} label={primaryLabel} /><PageCta href="/docs#getting-started" label="Read the operating guide" variant="secondary" /></div></div>
      </section>
    </main>
    <footer className="border-t border-white/10 bg-[#050706]"><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8"><div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start"><div><Link href="/"><Image src="/assay-logo.svg" alt="Assay" width={148} height={36} className="h-9 w-auto" /></Link><p className="mt-4 text-base font-semibold text-zinc-300">Autonomous merchant treasury control</p></div><nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-zinc-300"><a href="#the-problem" className="hover:text-white">The problem</a><a href="#how-it-works" className="hover:text-white">How it works</a><a href="#what-you-get" className="hover:text-white">What you get</a><a href="#guide" className="hover:text-white">Guide</a><a href="https://github.com/TheWeirdDee/assay" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white hover:text-[#a8d14a]"><ExternalLink className="h-4 w-4" />GitHub</a></nav></div><div className="mt-10 border-t border-white/10 pt-6 text-sm text-zinc-400">Built for Cleanverse Build: Trusted Assets · Monad Testnet</div></div></footer>
    <LandingFooter appHref={appHref} primaryLabel={primaryLabel} />
  </div>;
}

function Signal({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) { return <div className="flex items-center gap-4"> <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-[#a8d14a] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><div><p className="text-sm text-zinc-400">{label}</p><p className={`mt-1 text-base font-bold ${tone}`}>{value}</p></div></div>; }
function Step({ number, icon, title, body, last }: { number: string; icon: React.ReactNode; title: string; body: string; last?: boolean }) { return <div className={`relative border-white/15 py-7 lg:border-t lg:px-6 ${last ? "" : "lg:border-r"}`}><div className="flex items-center justify-between"><span className="text-sm font-black text-[#a8d14a]">{number}</span><span className="text-zinc-400 [&>svg]:h-6 [&>svg]:w-6">{icon}</span></div><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 text-base leading-7 text-zinc-300">{body}</p></div>; }
function Outcome({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="flex gap-5 border-b border-white/10 pb-5"><span className="mt-1 text-[#a8d14a] [&>svg]:h-6 [&>svg]:w-6">{icon}</span><div><h3 className="text-xl font-black text-white">{title}</h3><p className="mt-2 text-base leading-7 text-zinc-300">{body}</p></div></div>; }
function Essential({ label, title, body }: { label: string; title: string; body: string }) { return <div className="border-t border-white/15 pt-6"><span className="text-sm font-black tracking-[.18em] text-[#a8d14a]">{label}</span><h3 className="mt-4 text-2xl font-black text-white">{title}</h3><p className="mt-3 text-base leading-7 text-zinc-300">{body}</p></div>; }
function LandingFooter({ appHref, primaryLabel }: { appHref: string; primaryLabel: string }) { return <footer className="border-t border-white/10 bg-[#050706]"><div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20"><div className="grid gap-12 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"><div className="max-w-sm sm:col-span-2 lg:col-span-1"><Link href="/"><Image src="/assay-logo.svg" alt="Assay" width={148} height={36} className="h-9 w-auto" /></Link><p className="mt-5 text-lg font-bold text-white">Autonomous merchant treasury control</p><p className="mt-3 text-sm leading-6 text-zinc-400">Judge treasury activity against identity, behavior, and reserve policy before verified assets become spendable or leave the wallet.</p><div className="mt-6"><PageCta href={appHref} label={primaryLabel} /></div></div><FooterGroup title="Product" links={[{ label: "The problem", href: "#the-problem" }, { label: "How it works", href: "#how-it-works" }, { label: "What you get", href: "#what-you-get" }]} /><FooterGroup title="Resources" links={[{ label: "Setup guide", href: "#guide" }, { label: "Documentation", href: "/docs" }, { label: "Sign in", href: "/login" }]} /><div><p className="text-xs font-black uppercase tracking-[.18em] text-zinc-500">Project</p><div className="mt-5 flex flex-col items-start gap-4 text-sm font-semibold text-zinc-300"><a href="https://github.com/TheWeirdDee/assay" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white"><ExternalLink className="h-4 w-4" />GitHub repository</a><a href="https://cleanverse.com/hackathon" target="_blank" rel="noreferrer" className="hover:text-white">Cleanverse Build</a><span className="text-zinc-500">Monad Testnet</span></div></div></div><div className="flex flex-col gap-3 pt-7 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between"><p>Built for Cleanverse Build: Trusted Assets</p><p>Assay on Monad Testnet</p></div></div></footer>; }
function FooterGroup({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) { return <div><p className="text-xs font-black uppercase tracking-[.18em] text-zinc-500">{title}</p><nav className="mt-5 flex flex-col items-start gap-4 text-sm font-semibold text-zinc-300">{links.map((link) => <Link key={link.href} href={link.href} className="hover:text-white">{link.label}</Link>)}</nav></div>; }
function PageCta({ href, label, variant = "primary" }: { href: string; label: string; variant?: "primary" | "secondary" }) { const style = variant === "primary" ? "bg-[#a8d14a] text-[#10150b] hover:bg-[#b8e05a]" : "border border-white/20 bg-transparent text-white hover:bg-white/5"; return <Link href={href} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-extrabold transition-colors ${style}`}>{label}{variant === "primary" && <ArrowRight className="h-4 w-4" />}</Link>; }
