import { describe, expect, it } from "vitest";
import { summarizeLedger } from "./aggregate";
import type { DecisionLogEntry } from "./types";

function entry(overrides: Partial<DecisionLogEntry>): DecisionLogEntry {
  return {
    id: "id",
    timestamp: "2026-07-31T00:00:00.000Z",
    payment: { from: "0xA", amount: 100, direction: "out", fundsRef: "f" },
    verdict: { decision: "ALLOW", signals: {}, rationale: "r" },
    outcome: "settled",
    amountUnits: "100000000",
    ...overrides,
  };
}

describe("summarizeLedger", () => {
  it("tallies settled amount and counts across mixed outcomes", () => {
    const entries: DecisionLogEntry[] = [
      entry({ outcome: "settled", payment: { from: "0xA", amount: 100, direction: "out", fundsRef: "1" } }),
      entry({ outcome: "settled", payment: { from: "0xB", amount: 50, direction: "out", fundsRef: "2" } }),
      entry({ outcome: "held_by_judgment", verdict: { decision: "HOLD", signals: {}, rationale: "r" } }),
      entry({ outcome: "held_by_judgment", verdict: { decision: "ESCALATE", signals: {}, rationale: "r" } }),
      entry({ outcome: "blocked_by_compliance", complianceCode: 3, complianceMessage: "frozen" }),
    ];

    expect(summarizeLedger(entries)).toEqual({
      settledCount: 2,
      settledAmount: 150,
      heldCount: 1,
      escalatedCount: 1,
      blockedByComplianceCount: 1,
    });
  });

  it("returns all zeros for an empty log", () => {
    expect(summarizeLedger([])).toEqual({
      settledCount: 0,
      settledAmount: 0,
      heldCount: 0,
      escalatedCount: 0,
      blockedByComplianceCount: 0,
    });
  });
});
