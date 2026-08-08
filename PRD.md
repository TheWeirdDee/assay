# ASSAY — Product Requirements

> **Historical planning document from the original 48h hackathon build.** It describes a
> single-merchant, file-storage, no-real-LLM scope that has since been superseded — see
> [README.md](README.md) for what's actually running today (multi-tenant accounts, Postgres,
> real inbound on-chain detection, a real Claude API call for rationale narration). Kept for
> history, not as current documentation.

> **An autonomous treasury operator for on-chain merchants.** Assay makes the decisions a compliance
> rail never makes — *when* to pay, whether to *hold*, how to *sequence*, when to *escalate* — and
> executes them only through Cleanverse's verified rails, so every move it decides is also provably
> clean. Cleanverse answers "is this transfer allowed?"; Assay answers "should this money move, now?"
> Fails closed on either compliance OR operating policy. Regulator-ready decision + compliance log.

Hackathon: **Cleanverse Build: Trusted Assets** (Monad Foundation). Track: **02 — Compliant DeFi**.
Build window: **Aug 8 00:00 – Aug 9 23:59 UTC (48h)**. Deploy on **Monad** (Cleanverse rules layer).

---

## 0. Real Cleanverse primitives (confirmed terminology — use these exact names)

- **A-Pass (CVI):** non-transferable, reusable, bank-verified identity credential bound to a wallet
  (open-banking authenticated, tiered). On-chain = pseudonymous credential tag/hash, no PII.
- **A-Token (CVA):** programmable wrapper mirroring regulated stablecoins; guarantees provenance;
  **by design, only transferable between A-Pass-verified wallets.**
- **CCP / policy engine:** autonomously enforces compliance per transaction — sanctions/blacklist,
  Travel Rule, location rules, regulatory metadata; produces audit-ready reports.
- Chain-agnostic, wallet-neutral. API v3 (sandbox creds issued on registration).

**Design consequence (honest):** the base identity gate (A-Token only moves between A-Pass wallets)
is *native to the protocol*. Assay does NOT claim to add that. Assay adds the **agent orchestration
layer on top**: autonomous operation of the full money loop, escrow-release logic, counterparty
policy beyond the base gate, spend controls, fail-closed handling, and the merchant-facing audit
product. Assay composes the rails; it doesn't reimplement them.

---

## 1. The gap — what Cleanverse does NOT do (read this first)

Cleanverse already ships: verified identity (A-Pass), verified assets (A-Token), sanctions/Travel-Rule
enforcement, and audit-ready reports. So "accept clean money from verified parties with an audit
trail" is **Cleanverse's own product** — building that is rebuilding the platform.

**The line that makes Assay a product, not a wrapper:**
Cleanverse answers **"is this transfer ALLOWED?"** (compliance).
Assay answers **"SHOULD this money move — now, in this order — or should I hold and escalate?"**
(autonomous treasury operation). Cleanverse never makes the second decision. It validates a transfer;
it never *runs your money for you over time.*

A merchant's real money operation is not one compliant transfer — it's a continuous stream of
**judgments** no compliance rail makes:
- This inbound payment is verified-clean, but it's 3× the usual from a brand-new counterparty —
  accept, or **hold for review** even though it passes compliance?
- My outflows this week exceed my verified inflows — **pause payouts** until inflows clear?
- Supplier is verified today but their risk signal shifted — **still pay, or escalate**?
- In what **order** do I receive → hold → judge → release → trigger the next payout → reconcile?

Compliance says a transfer is *permitted*. It never says a transfer is *timely, wise, or should
happen now*. **That operational judgment is the gap, and it is the product.**

**The honesty test (passes):** strip Cleanverse out → Assay is still an agent making real treasury
judgments (timing, holds, sequencing, escalation) — it just loses the compliance guarantee. Strip
Assay out → you have Cleanverse: compliant transfers you still operate by hand. Neither is the other.

---

## 2. The problem (whose wound this is)

A business that wants to run its money on-chain autonomously faces two unsolved things — and only one
is Cleanverse's:
- **Compliance** (Cleanverse solves this): is each transfer clean, verified, Travel-Rule-safe?
- **Operation** (NOBODY solves this): *who decides* when to pay, whether to hold, how to sequence,
  when to escalate — continuously, unattended, safely? Today that's a human treasurer, or a dumb
  script that fires payments on a timer with no judgment. Recent AI-agent failures made "a script
  with spend authority and no judgment" a visceral fear.

Assay is the missing **operator**: an autonomous treasury agent that makes the timing/sequencing/hold/
escalate decisions a compliance rail never will — and executes them only through Cleanverse's verified
rails, so every move it decides is also provably clean.

---

## 3. The solution — an autonomous treasury operator (judgment is the product)

Assay runs a merchant's money loop and makes the decisions Cleanverse doesn't. The compliance checks
(verify A-Pass, settle in A-Token, audit) are Cleanverse's contribution *underneath*; the **operating
judgment** is Assay's. Two layers, and the top one is the product:

**Layer 1 — Cleanverse (compliance, native): is this transfer allowed?**
Verify payer/counterparty A-Pass, settle in clean A-Token, produce the CCP audit record. Assay calls
these; it does not reimplement them.

**Layer 2 — Assay (operation, the product): should this money move, now, in this order?**
This is where the agent *decides*, and it's what no rail does:
- **Timing / hold judgment:** an inbound payment can be *compliance-clean yet operationally risky*
  (3× normal, new counterparty, unusual pattern). Assay can **hold it for review** even though
  Cleanverse would pass it — a decision compliance never makes.
- **Sequencing:** Assay orders the loop — receive → hold → judge → release → trigger dependent
  payouts → reconcile — rather than firing each transfer blindly.
- **Solvency / cadence judgment:** if committed outflows exceed cleared inflows, Assay **pauses or
  reprioritizes payouts** instead of overspending on a timer.
- **Escalation:** on an anomaly (spend spike, shifted counterparty risk, ambiguous case), Assay
  **stops and escalates to the merchant** rather than guessing — the answer to "an agent with spend
  authority and no judgment."
- **Fail-closed:** any move that fails EITHER Cleanverse compliance OR Assay's own operating policy is
  blocked/held/refunded and logged — never partial.

So the loop is not "verify→escrow→settle" (that's compliance). It's **"decide → (comply) → act →
reconcile,"** where the *decide* and *reconcile* are Assay and the *comply* is Cleanverse.

**Provable, disclosable:** every decision AND every transfer produces a record — the compliance proof
(CCP) plus Assay's *decision log* (why it held, why it escalated, why it sequenced this way),
disclosable to an auditor. Compliance shows the transfer was clean; Assay's log shows the operation
was sound.

---

## 4. Cleanverse integration depth (the 30-pt criterion)

Load-bearing; remove either and Assay collapses into unsafe autonomous payments.
- **A-Pass (CVI):** entry condition for every action both directions — binds the agent's mandate to
  an accountable human principal; verifies payer inbound, counterparty outbound.
- **A-Token (CVA):** sole settlement asset; inbound validated as clean-origination before release;
  outbound paid in A-Token.
- **CCP:** pre-transaction checks (identity, provenance, Travel Rule, sanctions) + audit report.
- **Clean Payment Rails:** escrow hold/release delivering the merchant-acceptance guarantee.
- **Agent Skill Framework:** the mandate/principal/counterparty/spend-control/audit scaffold that
  makes the autonomous loop safe.

---

## 5. Scope for 48h (one clean loop, real, no mock)

Build: one merchant, one Assay agent, running a real loop on the Cleanverse sandbox (Monad testnet):
an inbound payment the agent **judges then processes**, and an outbound payout the agent **sequences
and settles** — all real, no mock on the core path.

**Signature demo — TWO beats (the judgment is the star, not just compliance):**
1. **The operating-judgment beat (the differentiator):** an inbound payment arrives that is
   *compliance-clean* (passes Cleanverse) but *operationally anomalous* (3× normal, new counterparty)
   → **Assay HOLDS it and escalates to the merchant**, even though Cleanverse would let it through.
   "Compliance said yes. Assay said *wait*. That decision is the product — no rail makes it."
2. **The fail-closed beat:** the agent attempts a payout to an unverified counterparty → stops
   on-chain, blocked, logged. The leash holds.

Beat 1 proves Assay isn't Cleanverse (it makes a decision compliance never makes). Beat 2 proves it's
safe. Lead with beat 1.

Cut order if tight: drop the 2nd outbound scenario, drop dashboard polish — **never drop the
operating-judgment beat (hold-and-escalate)** — that is what makes Assay a product and not a wrapper.

---

## 6. Judging map

| Weight | Criterion | Assay |
|---|---|---|
| 30 | Depth of CVI·CVA | A-Pass + A-Token gate every action both directions; CCP audit; load-bearing |
| 25 | Build Quality | one real end-to-end loop on sandbox+Monad, no mock on core path |
| 20 | Concept & Problem | the autonomous treasury operator — makes timing/hold/sequence/escalate decisions no rail makes; NOT a re-skin of Cleanverse compliance |
| 15 | UX & Demo | merchant dashboard + the "agent refuses" money shot |
| 10 | Scalability | pilotable with merchants/PSPs; multi-merchant, off-ramp roadmap |

---

## 7. Non-goals & the judgment boundary (important — avoids two opposite failures)
- **Don't reimplement Cleanverse** — don't rebuild verification, verified-asset transfer, sanctions,
  or Travel Rule. Those are native. Assay *calls* them. (Failure mode: becoming Cleanverse.)
- **Don't make the agent a dumb executor either** — if Assay only does verify→pay in sequence, it's a
  wrapper. The operating judgment (hold, sequence, pause, escalate) is mandatory; it's the product.
  (Failure mode: becoming a script.)
- **The judgment must be BOUNDED, not vibes.** Assay decides *timing/sequencing/hold/escalate* against
  explicit merchant-set operating policy (thresholds, solvency rules, anomaly limits) + reasoning —
  not freeform "should I pay this?" The agent judges *operations*; it never overrides *compliance*
  (a Cleanverse block is final). Money never moves on a vibe; it moves on policy + a logged decision.
- Not a custodian/exchange (software layer only — matches Cleanverse's own positioning).
