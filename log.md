# ASSAY — Build Log
Append-only, newest on top.

## [SEED] Project decided + registered
- Assay: autonomous merchant settlement agent, full money loop (in/out) gated by Cleanverse A-Pass
  (CVI) / A-Token (CVA) / CCP, fail-closed, auditor-disclosable. Track 02. Deploy Monad. 48h window.
- Registered ("Dear Assay"); sandbox credentials issued. Documentation access details are stored outside the repository.
- Confirmed real terms: A-Pass = bank-verified non-transferable identity credential; A-Token =
  provenance-guaranteed wrapper, only transferable between A-Pass wallets (base gate is NATIVE);
  CCP = policy engine (sanctions/Travel Rule/audit). Cleanverse's OWN materials name agentic-finance
  compliance rails as a use case → Assay is their stated roadmap, strong validation.
- Rules earned: deterministic money policy (no LLM); fail-closed; real calls no-mock; orchestrate
  don't reimplement; money shot = agent refusing an unverified payout.
- Open: exact API v3 endpoint routes (gated docs, confirm day 0); Monad testnet A-Token specifics.
<!-- new entries above -->

## [REFRAME] From "compliant settlement agent" to "autonomous treasury operator"
- PROBLEM caught: the old Assay (verify -> escrow -> settle + audit) WAS Cleanverse's own feature list
  (their site: "control of circulation, real-time tracking, audit-ready reports, sanctions exposure
  reduction"). That's a wrapper / rebuilding the platform = death.
- FIX (the bright line): Cleanverse answers "is this transfer ALLOWED?" (compliance). Assay answers
  "should this money move — now, in this order — or hold and escalate?" (operation). The rail never
  makes the second decision. Passes the strip test both ways.
- THE PRODUCT is the JUDGMENT ENGINE: per-merchant LEARNED baseline + 3 signals (amount anomaly,
  counterparty-newness, solvency) + REASONING over the combination + human-readable rationale log.
  Anti-wrapper proof: two identical-amount payments -> opposite decisions (impossible for a threshold).
- Money shot reframed: "Cleanverse said yes, Assay said wait" (hold a clean-but-risky payment) +
  identical-amounts-opposite-decisions.
- Gaps closed this pass (full finished-product check vs rubric): real on-chain completed result
  (no-mock), fail-closed as a shown beat (25 Build), product-grade merchant console (15 UX),
  pilotable/beyond-hackathon story (10 Scalability). CVI/CVA depth (30) intact — every ALLOW executes
  through A-Pass/A-Token/CCP. Concept (20) is now "operator, not re-skin of compliance."
- Rules applied: platform=rails/agent-acts-on-them; strip test; precise-provable-mechanism; one money
  shot; fails-closed-as-feature (GhostLend); real-completed-result-no-mock; product polish (Paayee);
  aim at judges' wound (compliance-vs-operations, their world). Track 02 kept (compliant DeFi).
