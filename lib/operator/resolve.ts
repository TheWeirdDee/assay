/**
 * The decision inbox's Approve/Reject actions. A merchant override still goes through Cleanverse --
 * "Assay judges operations, never overrides compliance" applies to the merchant too, not just the
 * agent. If compliance still blocks an approval attempt, the entry stays pending (not silently marked
 * resolved) so it can be retried once whatever's blocking it clears.
 */
import { learnCounterparty } from "../baseline/store";
import { listDecisions, updateDecision } from "../log/store";
import type { DecisionLogEntry } from "../log/types";
import type { ExecuteDeps } from "./execute";

export type ApprovalOutcome =
  | { status: "cleared"; complianceCode?: number; complianceMessage?: string }
  | { status: "settled"; txHash: string; complianceCode: number; complianceMessage: string }
  | { status: "blocked_by_compliance"; complianceCode: number; complianceMessage: string };

function findPendingEntry(entries: DecisionLogEntry[], entryId: string): DecisionLogEntry {
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) throw new Error(`No decision log entry with id ${entryId}`);
  if (entry.outcome !== "held_by_judgment" || entry.resolution) {
    throw new Error(`Entry ${entryId} is not a pending inbox item`);
  }
  return entry;
}

/**
 * Merchant approves a held/escalated payment. Re-checks Cleanverse compliance (a merchant can't
 * override that any more than Assay can) and, only if it passes, settles for real on-chain. On
 * success, the counterparty is fed back into the learned baseline -- the whole point of the loop.
 */
export async function approveHeldPayment(
  merchantId: string,
  entryId: string,
  deps: ExecuteDeps,
): Promise<{ entry: DecisionLogEntry; approval: ApprovalOutcome }> {
  const entries = await listDecisions(merchantId);
  const entry = findPendingEntry(entries, entryId);

  // An inbound transfer has already settled into the merchant wallet. Approving it clears the
  // internal quarantine only; sending it again would incorrectly pay the sender back.
  if (entry.payment.direction === "in") {
    const updated = await updateDecision(merchantId, entryId, {
      resolution: "approved",
      resolvedAt: new Date().toISOString(),
    });
    await learnCounterparty(merchantId, entry.payment.from);
    return { entry: updated ?? entry, approval: { status: "cleared" } };
  }

  const compliance = await deps.verifyCompliance(entry.payment.from);
  if (compliance.code !== 4) {
    return {
      entry,
      approval: { status: "blocked_by_compliance", complianceCode: compliance.code, complianceMessage: compliance.message },
    };
  }

  const txHash = await deps.settle(entry.payment.from, BigInt(entry.amountUnits));
  let updated = await updateDecision(merchantId, entryId, {
    resolution: "approved",
    resolvedAt: new Date().toISOString(),
    resolvedTxHash: txHash,
    complianceCode: compliance.code,
    complianceMessage: compliance.message,
  });

  // The transfer above is final before report enrichment begins. Cleanverse indexing can lag, so
  // report failure is deliberately fail-soft and persists no invented artifact reference.
  if (deps.getAuditReport) {
    try {
      const auditReportUrl = await deps.getAuditReport(entry.payment.from, txHash);
      if (auditReportUrl) {
        updated = await updateDecision(merchantId, entryId, { auditReportUrl });
      }
    } catch {
      // Keep the confirmed settlement and its log; the UI reports the artifact as unavailable.
    }
  }
  await learnCounterparty(merchantId, entry.payment.from);

  return {
    entry: updated ?? entry,
    approval: { status: "settled", txHash, complianceCode: compliance.code, complianceMessage: compliance.message },
  };
}

/**
 * Merchant rejects a held/escalated entry as a ledger-only resolution. For inbound entries the
 * funds already arrived and remain quarantined; rejection never initiates a refund or chain write.
 * For outbound entries, no transfer is initiated.
 */
export async function rejectHeldPayment(merchantId: string, entryId: string): Promise<DecisionLogEntry> {
  const entries = await listDecisions(merchantId);
  const entry = findPendingEntry(entries, entryId);
  const updated = await updateDecision(merchantId, entryId, {
    resolution: "rejected",
    resolvedAt: new Date().toISOString(),
  });
  if (!updated) throw new Error(`Failed to update entry ${entryId}`);
  // Reading direction here makes the ledger-only inbound rule explicit and durable in this branch.
  if (entry.payment.direction === "in") return updated;
  return updated;
}
