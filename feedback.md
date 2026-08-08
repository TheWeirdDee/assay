# Cleanverse Integration Feedback — Assay

> Fill in HONESTLY from the real build.

## What we built
Assay: an autonomous treasury operator for on-chain merchants. It makes operating decisions no
compliance rail makes (when to pay, whether to hold, how to sequence, when to escalate) via a
per-merchant learned baseline + multi-signal reasoned judgment, and executes every allowed move only
through Cleanverse's verified rails (A-Pass, A-Token, CCP). Deployed on the Cleanverse sandbox + Monad
testnet.

## Developer experience
- **A-Pass (CVI) verify:** [clarity, latency, tiers, sandbox test wallets]
- **A-Token (CVA):** [mint/wrap, A-Pass-gated transfer, provenance/clean-origination check]
- **CCP checks + report:** [pre-tx allow/deny + reason; audit report extraction for our dual log]
- **Clean Payment Rails / escrow:** [hold/release/refund for our hold decisions]
- **Auth / API v3 / docs:** [sandbox setup, docs access-code flow, endpoint clarity]

## Friction points & suggestions
- [e.g. did CCP expose WHY a transfer was blocked (so our decision log can cite it)? escrow-hold
  ergonomics for our operational holds (vs compliance holds)? Monad testnet notes?]

## What worked well
- [honest positives — e.g. native A-Pass-gated transfer meant compliance was reliable, letting us
  focus the build on the operating-judgment layer on top]
