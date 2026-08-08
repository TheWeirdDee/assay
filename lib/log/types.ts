import type { Payment, Verdict } from "../judgment/engine";
import type { ExecutionOutcome } from "../operator/execute";

/**
 * The dual log: Assay's decision (the WHY) alongside Cleanverse's compliance proof (the WAS-IT-CLEAN),
 * one entry per action, disclosable to an auditor. Compliance shows the transfer was clean; this log
 * shows the operation was sound.
 */
export interface DecisionLogEntry {
  id: string;
  timestamp: string; // ISO-8601
  payment: Payment;
  verdict: Verdict;
  outcome: ExecutionOutcome["status"];
  /** On-chain unit amount (bigint serialized as string) -- needed to settle later if approved from the inbox. */
  amountUnits: string;
  txHash?: string;
  complianceCode?: number;
  complianceMessage?: string;
  /** Filled in later via a follow-up download_travel_rule call once Cleanverse indexes the tx. */
  auditReportUrl?: string;
  /** Merchant's response to a held/escalated entry from the decision inbox. */
  resolution?: "approved" | "rejected";
  resolvedAt?: string; // ISO-8601
  resolvedTxHash?: string; // set when approval led to a real on-chain settlement
  /** On-chain tx hash of the inbound transfer this entry was derived from (dedupe key for the poller). */
  sourceTxHash?: string;
}
