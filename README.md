# Assay

**A scheduled treasury operator for on-chain merchants.** Assay makes the decisions a compliance
rail never makes — *when* to pay, whether to *hold*, how to *sequence*, when to *escalate* — and
executes them only through Cleanverse's verified rails, so every move it decides is also provably
clean. **Cleanverse answers "is this transfer allowed?"; Assay answers "should this money move, now?"**

Deployed on **Monad testnet**, built against **Cleanverse API v3**.

## What this actually is

A multi-tenant web app. Anyone can create an account, create a merchant workspace on Assay's
Cleanverse sandbox integration, and run a real treasury operator against live Cleanverse
compliance checks and real on-chain settlement on Monad. It is not a fixed single-merchant demo and
there is no simulate-a-payment button — inbound payments are detected from real on-chain transfers
by a daily scheduled scan on the hosted free tier or an operator-triggered immediate sync,
outbound payments are real merchant-submitted payouts, and the judgment engine's decision on each one
is deterministic and logged.

## The gap Assay fills

Cleanverse already makes a transfer compliant — clean money, verified parties, and transaction
reporting. But a business's money isn't one transfer; it's a continuous stream of **operating
decisions** no compliance rail makes:

- This inbound is verified-clean but 3× normal from a new counterparty — classify the already-arrived
  funds as **cleared or quarantined for review** in the merchant ledger?
- Committed outflows exceed cleared inflows — **pause payouts**?
- In what **order** do I receive → judge → release → pay out → reconcile?

Compliance says a transfer is *permitted*. It never says it's *timely, wise, or should happen now*.
That operating judgment is the gap Assay fills.

## What Assay does

- **Layer underneath — Cleanverse (native):** verify A-Pass and settle in clean A-Token. After a
  confirmed outbound settlement, Assay requests the real Cleanverse transaction/Travel Rule report;
  if Cleanverse has not indexed it yet, the UI says pending/unavailable rather than inventing proof. Assay
  calls it; never rebuilds it. A compliance block is final and Assay never overrides it.
- **Layer on top — Assay (the product):** a per-merchant **learned baseline** + a **multi-signal
  reasoned decision** (amount anomaly, counterparty history, solvency) → **ALLOW / HOLD / ESCALATE**.
  The decision is computed by a small deterministic engine (`lib/judgment/engine.ts`) — not an LLM —
  because a money-moving decision in a compliance product has to be auditable and reproducible. A
  real Claude API call (`lib/judgment/llm.ts`) separately narrates *why* the engine decided what it
  decided, in plain language, for the decision log; if that call fails or is unavailable, the engine's
  own plain-language rationale is used instead, and the decision itself is unaffected either way.

## Why it's not a wrapper

Two payments with the **same amount** get **opposite decisions** because Assay reasons over
counterparty and solvency, not one number — a threshold can't do that (`lib/judgment/engine.test.ts`
asserts this directly). Strip Cleanverse out and Assay still makes real treasury judgments; strip
Assay out and you have Cleanverse — compliant transfers you operate by hand. Neither is the other.

## On custody

Assay is not custody-free. The server generates and stores a per-merchant signing key encrypted at
rest with AES-256-GCM, and the server can decrypt that key to sign transfers from that merchant's
managed sandbox wallet. The key is used only by the Cleanverse-verified payout path, but compromise
of the application and its encryption key could expose signing authority. This design is testnet-only;
real-value production requires an external signer, embedded wallet, or scoped smart-account mandate.

## Architecture

| Layer | Implementation |
|---|---|
| Auth | Email/password, scrypt hashing, DB-backed sessions (`lib/auth`) |
| Multi-tenancy | One Postgres row per merchant; each carries its own managed sandbox wallet, A-Token, policy, baseline, and decision log (`lib/merchants`) |
| Judgment engine | Deterministic multi-signal reasoning (`lib/judgment/engine.ts`), LLM-narrated rationale (`lib/judgment/llm.ts`) |
| Compliance | Cleanverse API v3 — `verify_apass`, `query_txs`, `download_travel_rule` (`lib/cleanverse`) |
| Settlement | viem against Monad testnet, real `erc20Transfer` (`lib/chain`) |
| Inbound detection | Polls A-Token `Transfer` events to the merchant's wallet since the last synced block (`lib/chain/inboundLogs.ts`, `lib/operator/inboundSync.ts`) — not a simulate button |
| Persistence | Postgres (`lib/db`); every merchant's decision log and learned baseline live in the database, not flat files, so the app works on a real serverless/production deploy |
| Web | Next.js 16 (webpack), Tailwind |

Only Monad testnet has a real settlement client wired up today (`lib/chain/monad.ts`). Cleanverse
itself is multi-chain, but onboarding is currently restricted to Monad — offering other chains without
a real RPC client for them would just be a new version of the same honesty problem this rebuild was
about fixing.

## Running it

1. **Provision Postgres.** Any Postgres 14+ works — neon.com / Supabase / Vercel Postgres all have a
   free tier that takes a couple of minutes to set up.
2. **Copy `.env.example` to `.env.local`** and fill in `DATABASE_URL`, Assay's server-side Cleanverse
   credentials, optional `ANTHROPIC_API_KEY`, and generated secrets. Users never enter infrastructure secrets.
3. **Run the migration:** `npm run db:migrate`
4. **Start the app:** `npm run dev`
5. **Sign up**, then create a workspace (`/app/new`). Assay selects Monad and aUSDC and creates a
   managed sandbox wallet, showing its recovery key once.
6. **Fund the wallet** with Monad testnet MON (for gas) and the A-Token you'll settle in, and make
   sure it holds an A-Pass credential — Assay can't do anything until Cleanverse will.
7. Configure a scheduler to call `GET /api/cron/poll-inbound` with `Authorization: Bearer $CRON_SECRET`.
   The manual sync control remains available as a recovery/diagnostic action.

For Vercel Hobby, `vercel.json` schedules this route daily. Set `CRON_SECRET` in the Vercel project;
Vercel includes it as the bearer token on cron invocations. Use an external free scheduler with the
same authorization header later if more frequent polling is required.

## Tests

`npm test` runs the pure-logic suite (judgment engine, aggregation, orchestration with mocked stores)
unconditionally. The Postgres-backed store tests (`lib/log/store.test.ts`,
`lib/baseline/store.test.ts`) additionally run whenever `DATABASE_URL` is set, against a real
database — they create and tear down their own throwaway rows.

## Honesty note

This project was originally built in 48 hours for Cleanverse Build: Trusted Assets (Monad
Foundation). What's described above is the current, hardened state — multi-tenant accounts, real
Postgres persistence, real inbound-transfer detection, and an LLM call that does exactly what it's
documented to do — not the original single-merchant hackathon build, which used flat-file storage,
hardcoded demo scenarios, and a rationale generator that was templated text mislabeled as an LLM. The
original planning docs (`PRD.md`, `ARCHITECTURE.md`, `BUILD_PHASES.md`, `DEMO_SCRIPT.md`) are kept for
history but describe that earlier scope, not the app as it runs today.
