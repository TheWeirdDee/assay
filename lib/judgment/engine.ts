/**
 * Assay — the JUDGMENT ENGINE. This is the product: the decision Cleanverse never makes.
 *
 * Signals are computed as REAL numbers (deterministic), then REASONED over in context (not a
 * threshold) by this pure function. Two identical-amount payments can get OPPOSITE decisions because
 * the other signals differ — that is the proof this is an agent, not a script. ALLOW → execute via
 * Cleanverse. HOLD/ESCALATE → funds never move; merchant is notified.
 *
 * The decision itself (ALLOW/HOLD/ESCALATE) is deterministic and auditable on purpose — a compliance
 * product cannot have a money-moving decision made by a non-deterministic model. `rationale` here is
 * the honest, always-available explanation. A richer natural-language narration of that same decision
 * is generated separately by a real LLM call (see lib/judgment/llm.ts) and layered on top for display
 * — it never changes the decision, only how it's explained.
 *
 * Assay judges OPERATIONS. It never overrides COMPLIANCE — a Cleanverse block is final.
 */

export type Address = string;

export interface MerchantPolicy {
  solvencyRule: boolean; // don't let committed outflows exceed cleared inflows
  anomalyTolerance: "low" | "medium" | "high";
  escalateTo: string; // merchant contact for holds
}

export interface Baseline {
  // LEARNED per-merchant (not hardcoded) — updated by feedback
  amountMean: number;
  amountStd: number;
  knownCounterparties: Set<Address>;
  clearedInflows: bigint;
  committedOutflows: bigint;
}

export interface Payment {
  from: Address;
  amount: number;
  direction: "in" | "out";
  fundsRef: string;
}

export type Decision = "ALLOW" | "HOLD" | "ESCALATE";

export interface Verdict {
  decision: Decision;
  rationale: string;
  signals: Record<string, number | string>;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  llmSummary?: string;
}

// --- deterministic signals (real numbers) ---
const zscore = (x: number, mean: number, std: number) => (std === 0 ? 0 : (x - mean) / std);

function counterpartyRisk(p: Payment, b: Baseline): { score: number; note: string } {
  if (!b.knownCounterparties.has(p.from)) return { score: 1.0, note: "counterparty first seen today" };
  return { score: 0.0, note: "known counterparty" };
}

function solvencyBreach(p: Payment, b: Baseline, policy: MerchantPolicy): { breach: boolean; note: string } {
  if (!policy.solvencyRule || p.direction === "in") return { breach: false, note: "n/a" };
  const wouldBe = b.committedOutflows + BigInt(Math.round(p.amount));
  const breach = wouldBe > b.clearedInflows;
  return { breach, note: breach ? "would exceed cleared inflows" : "within cleared inflows" };
}

/**
 * REASON over the signals — NOT a single threshold. The combination + context decides.
 */
export function judge(p: Payment, b: Baseline, policy: MerchantPolicy): Verdict {
  const z = zscore(p.amount, b.amountMean, b.amountStd);
  const cp = counterpartyRisk(p, b);
  const solv = solvencyBreach(p, b, policy);
  const tol = { low: 1.5, medium: 2.5, high: 3.5 }[policy.anomalyTolerance];

  const signals = { amountZ: +z.toFixed(2), counterparty: cp.note, solvency: solv.note };

  // OUTBOUND that breaches solvency → hold regardless of amount (protect the merchant)
  if (solv.breach) {
    const rationale = `Holding $${p.amount}: paying it now ${solv.note} — it would leave you spending money that hasn't cleared. Approve to override or wait for inflows.`;
    return {
      decision: "HOLD",
      signals,
      rationale,
      riskLevel: "CRITICAL",
    };
  }

  // INBOUND/OUTBOUND: anomaly is a COMBINATION, not one signal.
  // Large AND new → escalate. Large but known → allow. New but small/normal → allow.
  if (z >= tol && cp.score >= 1.0) {
    const rationale = `Escalating $${p.amount}: ${z.toFixed(1)}× your typical, AND from a ${cp.note}. Size + newness together exceed your ${policy.anomalyTolerance} tolerance. Approve or reject?`;
    return {
      decision: "ESCALATE",
      signals,
      rationale,
      riskLevel: "HIGH",
    };
  }

  if (z >= tol && cp.score < 1.0) {
    const rationale = `Allowing $${p.amount}: ${z.toFixed(1)}× your typical, but a ${cp.note} — large size alone from a trusted party is within policy.`;
    return {
      decision: "ALLOW",
      signals,
      rationale,
      riskLevel: "MEDIUM",
    };
  }

  const rationale = `Allowing $${p.amount}: within your normal range, no risk signals.`;
  return {
    decision: "ALLOW",
    signals,
    rationale,
    riskLevel: "LOW",
  };
}

/**
 * THE ANTI-WRAPPER PROOF (use this as a demo beat + a test):
 * two payments, SAME amount, OPPOSITE decisions — impossible for a threshold.
 */
export function proofIdenticalAmountsDifferentDecisions() {
  const base: Baseline = {
    amountMean: 1000,
    amountStd: 400,
    knownCounterparties: new Set(["0xTRUSTED"]),
    clearedInflows: 100000n,
    committedOutflows: 0n,
  };
  const policy: MerchantPolicy = { solvencyRule: true, anomalyTolerance: "medium", escalateTo: "merchant" };
  const a = judge({ from: "0xTRUSTED", amount: 4000, direction: "in", fundsRef: "x" }, base, policy);
  const b = judge({ from: "0xNEWPARTY", amount: 4000, direction: "in", fundsRef: "y" }, base, policy);
  // a.decision === "ALLOW"  (4x normal but trusted)   b.decision === "ESCALATE" (4x normal AND new)
  return { trusted: a, newParty: b };
}

