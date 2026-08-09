# ASSAY — Architecture (autonomous treasury operator on Cleanverse rails)

> **Historical planning document from the original 48h hackathon build.** Two things below no
> longer match reality: it describes the rationale as "LLM reasoning over deterministic signals"
> inline with the decision (the decision is deterministic-only, in `lib/judgment/engine.ts`; a
> real, separate Claude API call in `lib/judgment/llm.ts` narrates it afterward and never affects
> it), and it describes single-merchant file storage (now per-merchant Postgres — see
> [README.md](README.md)). Kept for history, not as current documentation.

## 1. Two layers — the whole design

```
        MERCHANT sets operating policy (normal ranges, solvency rule, anomaly tolerance, escalation)
                                          │
                                          ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                         ASSAY  — the OPERATOR (the product)               │
   │   answers: "should this money move — now, in this order — or hold?"       │
   │                                                                            │
   │   JUDGMENT ENGINE (per-merchant, multi-signal, reasoned, logged):         │
   │     signal 1: amount anomaly vs learned baseline                          │
   │     signal 2: counterparty history (new? first at this size? reversed?)   │
   │     signal 3: solvency state (would this breach cleared-inflow rule?)     │
   │     → REASON over signals in context → decision: ALLOW / HOLD / ESCALATE  │
   │     → write human-readable RATIONALE to the decision log                  │
   └───────────────────────────────┬──────────────────────────────────────────┘
                                    │ only ALLOWed actions execute, and only via ↓
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                   CLEANVERSE — the RAILS (native, load-bearing)           │
   │   answers: "is this transfer ALLOWED?" (compliance — Assay never rebuilds)│
   │   A-Pass (CVI) verify · A-Token (CVA) settle · CCP audit · sanctions/TravelRule │
   └───────────────────────────────┬──────────────────────────────────────────┘
                                    ▼
                    REAL on-chain result on Monad testnet (settled / held / refunded)
                    + two disclosable logs: CCP compliance proof  &  Assay decision log
```

**The bright line (memorize):** Cleanverse decides *allowed*; Assay decides *should-it-happen-now*.
A Cleanverse compliance block is FINAL — Assay never overrides it. Assay only adds operating judgment
ON TOP of compliant transfers. Remove Cleanverse → Assay still judges (loses the compliance guarantee).
Remove Assay → you have Cleanverse (compliant transfers you operate by hand). Neither is the other.

## 2. Components

| Layer | Choice | Role |
|---|---|---|
| Judgment engine | TS decision core + LLM reasoning over deterministic signals | the product: allow/hold/escalate + rationale |
| Baseline store | per-merchant rolling history (amounts, counterparties, cadence, solvency) | "anomalous for THIS merchant", learned not hardcoded |
| Compliance rails | Cleanverse API v3: A-Pass, A-Token, CCP, Clean Payment Rails | verify/settle/audit — native, called not rebuilt |
| Chain | Monad testnet (Cleanverse rules layer) | real on-chain settlement of A-Token |
| Merchant console | Next.js 16.2 (--webpack), TS, Tailwind | product-grade UX: inbox of decisions, rationale, approve/reject, ledger |
| Logs | CCP compliance record + Assay decision log | dual disclosure to an auditor |

## 3. The judgment engine (this is the build — must be genuinely intelligent, not one `if`)

Signals are computed as REAL NUMBERS (deterministic), then REASONED over (contextual), then LOGGED:

```
score_payment(p, merchant):
  s_amount   = zscore(p.amount, merchant.baseline.amounts)      # anomaly vs THIS merchant's normal
  s_party    = counterparty_risk(p.from, merchant.history)      # new / first-at-size / prior-reversal
  s_solvency = solvency_delta(p, merchant.cleared_inflows,      # would this breach the solvency rule?
                              merchant.committed_outflows)
  # REASON (not a threshold): weigh the combination in context, produce decision + rationale
  decision, rationale = reason(p, s_amount, s_party, s_solvency, merchant.policy)
  log(merchant, p, decision, rationale)                         # human-readable WHY
  return decision   # ALLOW → execute via Cleanverse | HOLD/ESCALATE → do not move, notify merchant
```

**Why this can't collapse to a script (the anti-wrapper proof):** no single signal decides. Two
payments with IDENTICAL amounts get OPPOSITE decisions because counterparty/solvency differ — a
threshold cannot do that. The rationale is contextual prose a script can't produce. The baseline is
learned per-merchant, so "the threshold" is derived from data, not written. Feedback (merchant
approve/reject) updates the baseline → it improves. Intelligent + bounded (reasons over facts; never
overrides a Cleanverse compliance block).

## 4. Fail-closed (GhostLend rule — a designed, shown feature)

Any action that fails EITHER layer is a clean, logged no-op — never partial:
- Cleanverse compliance fail → blocked at the rail (final), logged.
- Assay operating-policy fail (over solvency, anomaly + new party, over cap) → HELD/ESCALATED, funds
  never move, logged with rationale.
The failure PATH is a demo beat, not a hidden branch: the money shot IS a hold/refuse with its reason.

## 5. The real completed result (no-mock rule — what the demo SHOWS)

Every ALLOW ends in a REAL on-chain A-Token settlement on Monad testnet — show the tx + the settled
state, not just a UI toast. An outbound HOLD shows funds were not sent. An inbound HOLD is only a
ledger quarantine applied after funds already arrived on-chain; it is never described as escrow or a
blocked transfer. No mock on the core path.

## 6. Merchant console (UX — 15 pts, product-grade, Paayee rule)

Not a dev tool — a treasury-ops product a real merchant could use:
- **Decision inbox:** pending escalations with plain-language rationale + Approve / Reject.
- **Live ledger:** inflows (cleared vs held), outflows (settled vs paused), solvency at a glance.
- **Decision log:** every allow/hold/escalate with its WHY, filterable, auditor-exportable.
- **Compliance panel:** the CCP proof per action (Cleanverse layer), disclosable.
Clean, calm, legible — "make treasury operation feel ordinary," not a crypto experiment.

## 7. Scalability / beyond-hackathon (10 pts + "pilotable" consideration)

- Multi-merchant: each merchant is a policy + baseline; the engine is tenant-agnostic.
- Pilotable with a real merchant/PSP: policy is plain-language, the console is ops-grade, both logs
  are auditor-ready — a design partner could run a shadow account day one.
- Roadmap: more signals (velocity, timing, tier), off-ramp integration, treasury rules (auto-sweep,
  reserve targets), multi-chain via Cleanverse's chain-agnostic layer.

## 8. What is native vs what Assay adds (honesty for README/judges)
Native (Cleanverse): identity verify, verified-asset transfer, sanctions/Travel Rule, audit reports.
Assay adds: the per-merchant learned baseline, the multi-signal reasoned decision (allow/hold/escalate),
the decision log/rationale, the solvency-aware sequencing, the fail-closed operating layer, and the
merchant treasury console. Assay composes the compliant rail into an autonomous OPERATOR.
