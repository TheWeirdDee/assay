/**
 * Phase 2 — ALLOW executes only through Cleanverse, and everything fails closed.
 *
 * Order of gates for an outbound payment, both must open:
 *   1. Assay's own operating judgment (lib/judgment/engine.ts) -- ALLOW / HOLD / ESCALATE.
 *   2. Cleanverse compliance (verify_apass) -- checked ONLY when Assay would ALLOW, since there's no
 *      point compliance-checking a payment Assay wouldn't move anyway.
 * A Cleanverse compliance block is FINAL: even if Assay's judgment says ALLOW, a non-4 verify_apass
 * result stops the transfer. Assay never overrides compliance -- it only adds judgment on top of it.
 *
 * Inbound payments arrive via an on-chain push from the counterparty (there is no Cleanverse escrow
 * primitive), so there's no transfer for Assay to gate -- ALLOW/HOLD/ESCALATE for inbound is a ledger
 * status (cleared vs. held-for-review), not an on-chain action. This module covers outbound only.
 */
import { judge, type Baseline, type MerchantPolicy, type Payment, type Verdict } from "../judgment/engine";

export type ExecutionOutcome =
  | { status: "held_by_judgment"; verdict: Verdict }
  | { status: "blocked_by_compliance"; verdict: Verdict; complianceCode: number; complianceMessage: string }
  | { status: "settled"; verdict: Verdict; txHash: string; complianceCode: number; complianceMessage: string };

export interface ExecuteDeps {
  /** Cleanverse compliance pre-flight. Must return { code, message } shaped like verify_apass's data. */
  verifyCompliance: (counterparty: string) => Promise<{ code: number; message: string }>;
  /** The actual on-chain settlement call (A-Token transfer). Only invoked after both gates open. */
  settle: (counterparty: string, amount: bigint) => Promise<string>;
  /** Best-effort Cleanverse transaction report lookup after confirmation/indexing. */
  getAuditReport?: (counterparty: string, txHash: string) => Promise<string | undefined>;
}

const CLEANVERSE_ALLOWED_CODE = 4;

/**
 * Executes (or holds, or blocks) one outbound payment. Never throws on a HOLD/ESCALATE/compliance
 * block -- those are expected, logged outcomes, not errors. Only infra failures (network, etc.) throw.
 */
export async function executeOutboundPayment(
  payment: Payment,
  baseline: Baseline,
  policy: MerchantPolicy,
  amountUnits: bigint,
  deps: ExecuteDeps,
): Promise<ExecutionOutcome> {
  const verdict = judge(payment, baseline, policy);

  if (verdict.decision !== "ALLOW") {
    return { status: "held_by_judgment", verdict };
  }

  const compliance = await deps.verifyCompliance(payment.from);
  if (compliance.code !== CLEANVERSE_ALLOWED_CODE) {
    return {
      status: "blocked_by_compliance",
      verdict,
      complianceCode: compliance.code,
      complianceMessage: compliance.message,
    };
  }

  const txHash = await deps.settle(payment.from, amountUnits);
  return {
    status: "settled",
    verdict,
    txHash,
    complianceCode: compliance.code,
    complianceMessage: compliance.message,
  };
}
