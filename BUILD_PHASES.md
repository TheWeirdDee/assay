# ASSAY — Build Phases (Aug 8-9, 48h). Autonomous treasury operator on Cleanverse rails.

> **Historical — describes the original 48h hackathon build, since superseded by a multi-tenant
> rebuild.** See [README.md](README.md) for the current architecture.

Real Cleanverse sandbox + Monad testnet. No mock on core path. The JUDGMENT ENGINE is the product —
build it genuinely (multi-signal, reasoned, logged), not as one threshold.

## Phase 0 — Wire Cleanverse + Monad (first)
- [ ] Auth with sandbox API Id + key. One real call succeeds (A-Pass verify on a test wallet).
- [ ] A-Token transfer between two A-Pass wallets on Monad testnet confirms. CCP audit record pulled.
- [ ] Commit: `phase-0: cleanverse rails wired, real verify + settle + audit`.
Gate: if a real verify+settle+audit round-trip doesn't work, fix before building the operator.

## Phase 1 — The judgment engine (the product — build it real)
- [ ] Per-merchant baseline (amounts mean/std, known counterparties, cleared inflows/committed outflows).
- [ ] Three signals: amount z-score vs baseline, counterparty-newness, solvency-breach.
- [ ] REASON over them (LLM given signals+policy) → ALLOW/HOLD/ESCALATE + human-readable rationale.
- [ ] Prove the anti-wrapper test: two SAME-amount payments → opposite decisions. Unit-test it.
- [ ] Commit: `phase-1: judgment engine (multi-signal, reasoned, logged)`.

## Phase 2 — Execute only through Cleanverse + fail-closed
- [ ] ALLOW → real A-Token settlement on Monad via Cleanverse (show real tx).
- [ ] HOLD/ESCALATE → funds never move; merchant notified; logged.
- [ ] Cleanverse compliance block → final, logged (Assay never overrides). Fail-closed everywhere.
- [ ] Commit: `phase-2: allow-executes-via-cleanverse + fail-closed`.

## Phase 3 — Dual log + disclosure (trust)
- [ ] CCP compliance proof per action + Assay decision log (the WHY). Auditor-exportable.
- [ ] Commit: `phase-3: compliance proof + decision log, disclosable`.

## Phase 4 — Merchant console (UX 15 pts — product-grade, not a dev tool)
- [ ] Decision inbox (pending escalations + rationale + Approve/Reject), live ledger (cleared vs held,
      settled vs paused, solvency at a glance), decision log, compliance panel.
- [ ] Feedback loop: approve/reject updates the baseline (trusted party learned).
- [ ] Commit: `phase-4: merchant treasury console`.

## Phase 5 — Submission (Build 25 + Scalability 10 + pilotable)
- [ ] README (operator framing, native-vs-added honesty), the beyond-hackathon/pilot story.
- [ ] < 3-min video around beat 1 (hold a clean payment) + identical-amounts-opposite-decisions.
- [ ] Real deploy link, public repo, screenshots of real on-chain results.
- [ ] Commit: `phase-5: submission-ready`.

## Cut order: 2nd outbound scenario -> console polish -> 3rd signal (keep amount + solvency at minimum).
## NEVER cut: the judgment engine + the hold-a-clean-payment beat + identical-amounts proof + real
## on-chain result. Those ARE the product and the anti-wrapper proof.
