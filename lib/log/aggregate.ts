import type { DecisionLogEntry } from "./types";

export interface LedgerSummary {
  settledCount: number;
  settledAmount: number;
  heldCount: number;
  escalatedCount: number;
  blockedByComplianceCount: number;
}

export function summarizeLedger(entries: DecisionLogEntry[]): LedgerSummary {
  const summary: LedgerSummary = {
    settledCount: 0,
    settledAmount: 0,
    heldCount: 0,
    escalatedCount: 0,
    blockedByComplianceCount: 0,
  };

  for (const e of entries) {
    if (e.outcome === "settled") {
      summary.settledCount += 1;
      summary.settledAmount += e.payment.amount;
    } else if (e.outcome === "held_by_judgment") {
      if (e.verdict.decision === "ESCALATE") summary.escalatedCount += 1;
      else summary.heldCount += 1;
    } else if (e.outcome === "blocked_by_compliance") {
      summary.blockedByComplianceCount += 1;
    }
  }

  return summary;
}
