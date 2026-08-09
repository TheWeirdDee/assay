<div align="center">

# Assay

**A scheduled treasury operator for on-chain merchants.**

Cleanverse answers *"is this transfer allowed?"* — Assay answers *"should this money move, **now**?"*

`Monad Testnet` · `Cleanverse API v3` · `Next.js 16` · `Postgres` · `wagmi/viem`

</div>

---

## TL;DR

Cleanverse makes a transfer *compliant* — clean money, verified parties, audit-ready reporting. But a business's money isn't one transfer; it's a continuous stream of operating decisions no compliance rail makes: *when* to pay, *whether* to hold, *how* to sequence inflows against outflows, *when* to escalate to a human. **Assay is the judgment layer that makes those decisions and executes them only through Cleanverse's verified rails** — so every move it decides is also provably clean.

Two payments of the *same amount* can get opposite decisions, because Assay reasons over counterparty history and solvency, not a single threshold. Strip Cleanverse out and Assay still makes real treasury judgments; strip Assay out and you have Cleanverse — compliant transfers you operate by hand. Neither is the other.

---

## On-chain evidence

All transactions below are real, executed on Monad testnet, receipts confirmed
`status: success`. They demonstrate the settlement path end to end. Run against the
development A-Token contract `0x9262C5fDA15665d02DaC9D8b6DF02903Be77375F` (the
Cleanverse-registered dev A-Token at build time, not the current canonical sandbox
aUSDC contract). The workspace wallet `0x502136A8eF821573D71760493dB65Fed7475A195`
holds an active Cleanverse A-Pass (CVI), tier 50.

| # | Action | Tx hash | Explorer |
|---|--------|---------|----------|
| 1 | A-Token deploy / init | 0x55b5821f0400f38fa00cab081e8d5d33ec7164d47a73a4e63d9b9bfa3aa4a960 | https://testnet.monadexplorer.com/tx/0x55b5821f0400f38fa00cab081e8d5d33ec7164d47a73a4e63d9b9bfa3aa4a960 |
| 2 | Grant merchant MINTER_ROLE | 0x8d0a9c4d8f518bdbb3752dcc0710fb98ca36597c3ab28d9748aa3b5c032a7118 | https://testnet.monadexplorer.com/tx/0x8d0a9c4d8f518bdbb3752dcc0710fb98ca36597c3ab28d9748aa3b5c032a7118 |
| 3 | Mint 1,000 A-Tokens | 0xee0503a26c5ce661622918406b2d1f24d6b8e2e98d0da174b22be7ccc4988f9d | https://testnet.monadexplorer.com/tx/0xee0503a26c5ce661622918406b2d1f24d6b8e2e98d0da174b22be7ccc4988f9d |
| 4 | ERC-20 transfer — 250 | 0xd140790ed7021b7935d008ebb560e62e88cb76338d811ff1d66f3a9a4821de9d | https://testnet.monadexplorer.com/tx/0xd140790ed7021b7935d008ebb560e62e88cb76338d811ff1d66f3a9a4821de9d |
| 5 | ERC-20 transfer — 50 | 0xc55bd0a9d1226539e18e25b98ea0d43d311aef344c0fad2a17e305b4636addff | https://testnet.monadexplorer.com/tx/0xc55bd0a9d1226539e18e25b98ea0d43d311aef344c0fad2a17e305b4636addff |
| 6 | ERC-20 transfer — 30 | 0x8c922c454d2d70bb024aac0243e06e26345c10424bc38f0c5597f5187053a583 | https://testnet.monadexplorer.com/tx/0x8c922c454d2d70bb024aac0243e06e26345c10424bc38f0c5597f5187053a583 |
| 7 | ERC-20 transfer — 45 | 0x0880981a0348e110794b1aba7230ff5b10bd23c6bfbfaaa85d81c44944f9b9c8 | https://testnet.monadexplorer.com/tx/0x0880981a0348e110794b1aba7230ff5b10bd23c6bfbfaaa85d81c44944f9b9c8 |
| 8 | ERC-20 transfer — 20 | 0xb0c00242780a0efe32b0890298f91d41297fe24b835b140cbcc095c4c10806df | https://testnet.monadexplorer.com/tx/0xb0c00242780a0efe32b0890298f91d41297fe24b835b140cbcc095c4c10806df |

Live-demo settlement in the hosted app is gated on Cleanverse-side sandbox aUSDC
depositor whitelisting; the readiness panel detects and reports this rather than
faking a balance.

---

## The gap Assay fills

Compliance says a transfer is *permitted*. It never says it is *timely*, *wise*, or *should happen now*.

| The operating question | Who answers it |
| --- | --- |
| Is the counterparty verified and the asset clean? | **Cleanverse** (A-Pass / A-Token / CCP) |
| This inbound is clean but 3× normal from a new party — clear it or quarantine it? | **Assay** |
| Committed outflows exceed cleared inflows — pause payouts? | **Assay** |
| In what order do I receive → judge → release → pay → reconcile? | **Assay** |
| Should this compliant payout happen *right now*? | **Assay** |

That operating judgment — everything in the **Assay** rows — is the product.

---

## How it works

Assay is two layers. The bottom layer is Cleanverse, used natively and never rebuilt. The top layer is Assay's own deterministic judgment.

```
                         ┌─────────────────────────────────────────────┐
                         │                  MERCHANT                    │
                         │   receives payments   ·   pays suppliers     │
                         └───────────────┬─────────────────────────────┘
                                         │
        money in (already on-chain)      │      money out (payout request)
                   │                     │                    │
                   ▼                     │                    ▼
        ┌─────────────────────┐         │        ┌──────────────────────────┐
        │  INBOUND DETECTION  │         │        │   OUTBOUND PAYOUT FORM    │
        │  scan A-Token       │         │        │   recipient + amount      │
        │  Transfer events    │         │        └────────────┬─────────────┘
        │  (daily cron / sync)│         │                     │
        └──────────┬──────────┘         │                     │
                   │                    │                     │
                   ▼                    ▼                     ▼
        ╔═══════════════════════════════════════════════════════════════╗
        ║                   ASSAY JUDGMENT ENGINE                        ║
        ║              (deterministic · reproducible)                    ║
        ║                                                               ║
        ║   signals:  amount z-score  ·  counterparty history  ·        ║
        ║             solvency / reserve coverage                       ║
        ║                                                               ║
        ║   verdict:  ALLOW  ·  HOLD  ·  ESCALATE                        ║
        ║                                                               ║
        ║   (a real Claude call narrates the verdict in plain English;  ║
        ║    it never makes the decision — fails soft to the engine's   ║
        ║    own rationale)                                             ║
        ╚═══════════════════════════════╤═══════════════════════════════╝
                                         │
                        outbound ALLOW   │   inbound cleared / quarantined
                                         │
                                         ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                   CLEANVERSE COMPLIANCE GATE                   │
        │        verify_apass  ·  A-Token settlement  ·  CCP            │
        │        (a compliance BLOCK is final — Assay cannot override)  │
        └───────────────────────────────┬───────────────────────────────┘
                                         │
                                         ▼
        ┌───────────────────────────────────────────────────────────────┐
        │              SETTLE ON MONAD  ·  real erc20Transfer           │
        │   then request the real Cleanverse Travel Rule report         │
        │   (pending/unavailable if not yet indexed — never faked)      │
        └───────────────────────────────────────────────────────────────┘
```

### The two flows, precisely

**Money in (inbound).** A customer sends A-Token (aUSDC) to the merchant's managed wallet. The funds have *already settled on-chain* — Assay cannot stop that. A daily scheduled scan (or an immediate operator sync) detects the transfer, then judges it:

- **Normal** (within the learned baseline, known counterparty) → **cleared** automatically; becomes spendable working capital.
- **Abnormal** (large z-score, first-time sender) → **quarantined** in the ledger for human review. Still visible, but *not counted as spendable*. Approving it flips the ledger state to cleared — **it never sends money anywhere** (inbound resolution is ledger-only, by design).

**Money out (outbound).** The merchant enters a supplier and amount. Assay evaluates, in order:

1. **Cash policy** — does cleared inflow cover this without breaching reserve policy? If not → **HOLD**.
2. **Cleanverse eligibility** — `verify_apass` on the counterparty. If ineligible → **BLOCK** (final).
3. If both pass → **ALLOW** → real `erc20Transfer` on Monad → request the real Cleanverse Travel Rule report → attach to the decision log.

### Decision states

| State | Meaning | Inbound result | Outbound result |
| --- | --- | --- | --- |
| **ALLOW** | Fits operating policy | Marked cleared | Proceeds to compliance, then settles |
| **HOLD** | Would breach a reserve/operating rule | — | No transfer; queued for review |
| **ESCALATE** | Unusual pattern (e.g. large + new party) | Quarantined for review | Queued for review with explanation |
| **BLOCK** | Cleanverse says wallet/asset ineligible | — | Transfer does not execute; Assay can't override |

---

## Why it is not a Cleanverse wrapper

- **Two identical amounts, opposite verdicts.** Because the engine reasons over counterparty history and solvency, not one number — a threshold cannot do this. `lib/judgment/engine.test.ts` asserts it directly.
- **The decision is deterministic, not an LLM.** A money-moving decision in a compliance product must be auditable and reproducible, so the verdict is computed by a small pure engine (`lib/judgment/engine.ts`). A separate real Claude call (`lib/judgment/llm.ts`) *narrates* the verdict in plain language for the log; if it fails, the engine's own rationale is used and the decision is unaffected.
- **Strip test.** Remove Cleanverse and Assay still makes real treasury judgments (less safe, still a product). Remove Assay and you have Cleanverse — compliant transfers you operate by hand.

---

## CVI · CVA integration points

Cleanverse is load-bearing, not decorative. Every value-moving action passes through it.

| Cleanverse primitive | Where Assay uses it | File |
| --- | --- | --- |
| **CVI — A-Pass identity** | `verify_apass` gates every outbound settlement; the counterparty must be verified or the payout is BLOCKed | `lib/cleanverse/client.ts` |
| **CVA — A-Token settlement** | The only settlement asset; real `erc20Transfer` of the A-Token on Monad | `lib/chain/erc20.ts`, `lib/chain/monad.ts` |
| **CCP — compliance + Travel Rule** | `query_txs` / `download_travel_rule` — after settlement Assay requests the real Cleanverse report and links it to the decision | `lib/cleanverse/client.ts`, `lib/operator/live.ts` |
| **AES/CBC request crypto** | Cleanverse v3 request encryption implemented to spec | `lib/cleanverse/crypto.ts` |

> Remove CVI and there is no verified party to gate on. Remove CVA and there is no clean asset to settle in. Remove CCP and there is no audit report. The product does not degrade without Cleanverse — it stops existing.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  WEB  ·  Next.js 16 (webpack) · Tailwind · wagmi/viem                 │
│  landing · auth · /app (merchant list) · /app/[id] (console)         │
└───────────────┬──────────────────────────────────────────────────────┘
                │  server actions
┌───────────────▼──────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                                    │
│                                                                       │
│  auth/           scrypt hashing · DB-backed sessions · ownership DAL  │
│  merchants/      per-merchant workspace, wallet, policy, baseline     │
│  judgment/       engine.ts (deterministic)  +  llm.ts (narration)     │
│  operator/       execute · resolve · inboundSync  (orchestration)     │
│  cleanverse/     v3 client + AES/CBC crypto                           │
│  chain/          viem · Monad settlement · inbound Transfer scan      │
│  security/       AES-256-GCM encryption of creds + signing keys       │
└───────┬───────────────────────────────────────────┬──────────────────┘
        │                                           │
┌───────▼─────────────┐                   ┌─────────▼────────────────────┐
│  POSTGRES           │                   │  EXTERNAL                     │
│  users · sessions   │                   │  Cleanverse API v3            │
│  merchants          │                   │  Monad testnet RPC            │
│  baselines          │                   │  Anthropic (optional, narr.)  │
│  decisions          │                   │  Vercel Cron (daily poll)     │
└─────────────────────┘                   └───────────────────────────────┘
```

**Multi-tenant by construction.** One Postgres row per merchant, each carrying its own managed sandbox wallet, A-Token, policy, learned baseline, and decision log — not a single hardcoded merchant. Every decision log and baseline lives in the database, not flat files, so the app runs on a real serverless/production deploy without amnesia.

**Only Monad testnet has a real settlement client wired up today** (`lib/chain/monad.ts`). Cleanverse is multi-chain, but onboarding is deliberately restricted to Monad — offering other chains without a real RPC client for them would be a new version of the exact honesty problem this build was hardened to remove.

---

## Run it locally

**Prerequisites:** Node 20+, a Postgres 14+ database (Neon / Supabase / Vercel Postgres free tier all work), Assay's server-side Cleanverse sandbox credentials.

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local
#    fill in: DATABASE_URL, Cleanverse creds, generated secrets,
#    and optionally ANTHROPIC_API_KEY (narration; app works without it)

# 3. Migrate the database
npm run db:migrate

# 4. Start
npm run dev
```

Then:

1. **Sign up**, and create a workspace at `/app/new`. Assay selects Monad + aUSDC and generates a **managed sandbox wallet**, showing its recovery key once.
2. **Activate the wallet** — this is the one step gated on Cleanverse:
   - **A-Pass (CVI):** generate an A-Pass for the workspace wallet (`generate_apass`).
   - **Gas:** fund with Monad testnet MON — [`faucet.monad.xyz`](https://faucet.monad.xyz/).
   - **A-Token (aUSDC):** call `query_deposit_address` for the wallet. Cleanverse only mints aUSDC for deposits from an approved institutional/faucet sender; an unapproved Circle faucet sender is refunded as plain USDC rather than converted. Use the Cleanverse sandbox faucet or ask Cleanverse to whitelist the depositor.
   - The **readiness panel** turns green when identity, gas, and settlement balance are all present. Assay refuses to settle until Cleanverse will.
3. **Run the flow** (see below).

**Scheduled inbound polling:** configure a scheduler to call `GET /api/cron/poll-inbound` with `Authorization: Bearer $CRON_SECRET`. On Vercel Hobby, `vercel.json` schedules this route daily; set `CRON_SECRET` in the project and Vercel sends it as the bearer token. The manual **Sync inbound transfers** control remains available as an immediate/diagnostic action.

---

## Demo flow

The sequence that exercises every judging axis end-to-end:

```
1. Readiness green      identity verified · MON funded · aUSDC funded
        │
2. Inbound NORMAL   →   send ~baseline aUSDC from a known wallet · Sync
        │               → auto-CLEARED · becomes working capital
        │
3. Inbound ABNORMAL →   send a large amount from a first-time sender · Sync
        │               → QUARANTINED (compliant per Cleanverse, held by Assay)
        │               → approve it → flips to cleared · NO second transfer
        │
4. Outbound BLOCK   →   pay an ineligible recipient
        │               → Assay refuses on-chain · the "agent stops itself" moment
        │
5. Outbound ALLOW   →   pay an eligible recipient within cleared inflow
        │               → real Monad tx hash · Travel Rule report attached
        │
6. Export           →   Audit Pack (JSON) / CSV · full decision-to-settlement trail
```

**The signature moment is step 4** — Assay refusing to move money it shouldn't, on-chain — followed by **step 3**, where Cleanverse says *allowed* and Assay still says *not yet*. That contrast is the entire thesis.

---

## Custody (read this)

**Assay is not custody-free.** The server generates and stores a per-merchant signing key, encrypted at rest with AES-256-GCM, and can decrypt it to sign transfers from that merchant's managed sandbox wallet. The key is used only by the Cleanverse-verified payout path, but compromise of the application *and* its encryption key could expose signing authority.

**This design is testnet-only.** Real-value production requires an external signer, embedded wallet, or scoped smart-account mandate. The readiness panel and docs state this plainly; the product does not claim protection it does not have.

---

## Tests

```bash
npm test          # pure-logic suite: judgment engine, aggregation,
                  # orchestration with mocked stores — runs unconditionally
```

Postgres-backed store tests (`lib/log/store.test.ts`, `lib/baseline/store.test.ts`) additionally run whenever `DATABASE_URL` is set, against a real database, creating and tearing down their own throwaway rows. Current suite: all green; `tsc --noEmit` clean; `next build --webpack` succeeds.

---

## Project layout

```
app/
  page.tsx                landing
  login/  signup/         auth pages
  app/                    merchant list
  app/[merchantId]/       per-merchant console + settings
  actions/                server actions (auth, merchants, payments)
  api/
    cron/poll-inbound/    scheduled real chain scan (bearer-authed)
    export-log/           auth-scoped JSON/CSV export
lib/
  auth/                   password, sessions, DAL
  merchants/              multi-tenant store
  judgment/               engine.ts (deterministic) · llm.ts (narration)
  operator/               execute · resolve · inboundSync · live
  cleanverse/             v3 client · crypto
  chain/                  monad · erc20 · inbound Transfer scan
  security/               AES-256-GCM
  db/                     schema.sql · client · migrate
```

---

## Honesty note

This project was originally built in 48 hours for **Cleanverse Build: Trusted Assets** (Monad Foundation). What's described here is the current, hardened state — multi-tenant accounts, real Postgres persistence, real inbound-transfer detection, and an LLM call that does exactly what it's documented to do.

It is **not** the original single-merchant hackathon build, which used flat-file storage, hardcoded demo scenarios, and a rationale generator that was templated text mislabeled as an LLM. Those three things were corrected honestly rather than hidden. The original planning docs (`PRD.md`, `ARCHITECTURE.md`, `BUILD_PHASES.md`, `DEMO_SCRIPT.md`) are kept for history but describe that earlier scope, not the app as it runs today.

---

<div align="center">

**Assay** — verified rails decide *if* money can move. Assay decides *when* it should.

Built for Cleanverse Build: Trusted Assets · Monad Testnet

</div>
