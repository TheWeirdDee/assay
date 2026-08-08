import type { Baseline, MerchantPolicy, Payment, Verdict } from "../judgment/engine";
import { generateLLMRationale } from "../judgment/llm";
import { appendDecision } from "../log/store";
import type { DecisionLogEntry } from "../log/types";
import { executeOutboundPayment, type ExecuteDeps, type ExecutionOutcome } from "./execute";

/**
 * Runs the judgment+compliance+settle pipeline, asks the LLM to narrate the (already-decided)
 * verdict, and writes the disclosable dual-log entry. `sourceTxHash` dedupes inbound transfers
 * discovered by the on-chain poller; omit it for merchant-initiated outbound payments.
 */
export async function executeAndLog(
  merchantId: string,
  payment: Payment,
  baseline: Baseline,
  policy: MerchantPolicy,
  amountUnits: bigint,
  deps: ExecuteDeps,
  sourceTxHash?: string,
): Promise<{ outcome: ExecutionOutcome; entry: DecisionLogEntry | null }> {
  const outcome = await executeOutboundPayment(payment, baseline, policy, amountUnits, deps);

  const llmSummary = await generateLLMRationale({
    payment,
    decision: outcome.verdict.decision,
    signals: outcome.verdict.signals,
    riskLevel: outcome.verdict.riskLevel,
    policy,
  });
  const verdict: Verdict = llmSummary ? { ...outcome.verdict, llmSummary } : outcome.verdict;
  const auditReportUrl = outcome.status === "settled"
    ? await deps.getAuditReport?.(payment.from, outcome.txHash)
    : undefined;

  const entry = await appendDecision(merchantId, {
    payment,
    verdict,
    outcome: outcome.status,
    amountUnits: amountUnits.toString(),
    ...(outcome.status === "settled" ? { txHash: outcome.txHash } : {}),
    ...(outcome.status === "settled" || outcome.status === "blocked_by_compliance"
      ? { complianceCode: outcome.complianceCode, complianceMessage: outcome.complianceMessage }
      : {}),
    ...(sourceTxHash ? { sourceTxHash } : {}),
    ...(auditReportUrl ? { auditReportUrl } : {}),
  });

  return { outcome, entry };
}
