# ASSAY — Demo Script (< 3 min)

> **Historical — written for the original single-merchant hackathon build's fixed demo scenarios,
> which no longer exist** (there is no simulate-payment button; inbound payments are detected from
> real on-chain transfers and outbound payments are real submitted payouts). See
> [README.md](README.md) for how to actually run the app today.

Lead with the JUDGMENT (what Cleanverse can't do). Everything real on Cleanverse sandbox + Monad
testnet — show real on-chain results, no mock on the core path.

## 0:00-0:30 — The gap (not a re-skin of Cleanverse)
"Cleanverse makes a transfer compliant — clean money, verified parties. But a business's money isn't
one transfer; it's a stream of decisions: should I pay now, hold this, pause payouts, escalate? No
compliance rail makes those calls. Assay is the operator that does — and it only ever moves money
through Cleanverse's verified rails."

## 0:30-1:30 — THE MONEY SHOT: "Cleanverse said yes. Assay said wait."
- An inbound payment arrives. Cleanverse layer: PASS (verified payer, clean A-Token). Compliance is
  happy.
- Assay layer: it's $4,000 — 4x this merchant's normal — from a counterparty first seen today.
- On screen: **Assay HOLDS it and escalates** with a plain rationale: "Clean, but 4x your typical from
  a brand-new counterparty — approve or reject?" Funds provably NOT released (show the held state).
- "Compliance allowed it. Assay held it. That decision is the product — the rail never makes it."

## 1:30-2:10 — Proof it's judgment, not a threshold
- Second inbound: SAME $4,000 — but from the merchant's long-trusted counterparty.
- Assay ALLOWS it → real A-Token settlement on Monad (show the tx / settled state).
- "Same amount. Opposite decisions. Because Assay reasons over counterparty and solvency, not one
  number. A script can't do that."

## 2:10-2:40 — Sequenced, solvency-aware, fail-closed
- Merchant pays a supplier. Assay checks solvency + sequences it → settles via Cleanverse (real tx).
- Then a payout to an UNVERIFIED counterparty → Cleanverse blocks at the rail, Assay logs it, nothing
  moves. Fail-closed, shown.

## 2:40-3:00 — Trust + close
- Open the dual log: CCP compliance proof (clean) + Assay decision log (why it held/allowed/sequenced)
  — auditor-disclosable. "Provably clean AND provably well-operated."
- "Assay: the autonomous treasury operator. Cleanverse says allowed; Assay says should-it-happen-now.
  Compliant by rail, sound by judgment."

## Notes: < 3:00 hard. Beat 1 (hold a clean payment) is the thumbnail — it proves Assay != Cleanverse.
## Show REAL on-chain results (settled tx or provably-held). Blast of jargon avoided — plain language.
