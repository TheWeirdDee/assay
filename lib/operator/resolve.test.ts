import { describe, expect, it, vi, beforeEach } from "vitest";
import type { DecisionLogEntry } from "../log/types";

const MERCHANT_ID = "merchant-1";
let entries: DecisionLogEntry[] = [];
const learnedCounterparties: string[] = [];

vi.mock("../log/store", () => ({
  listDecisions: vi.fn(async () => entries),
  updateDecision: vi.fn(async (_merchantId: string, id: string, patch: Partial<DecisionLogEntry>) => {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    entries[idx] = { ...entries[idx], ...patch };
    return entries[idx];
  }),
}));
vi.mock("../baseline/store", () => ({
  learnCounterparty: vi.fn(async (_merchantId: string, address: string) => {
    learnedCounterparties.push(address);
  }),
}));

const { approveHeldPayment, rejectHeldPayment } = await import("./resolve");

function heldEntry(overrides: Partial<DecisionLogEntry> = {}): DecisionLogEntry {
  return {
    id: "held-1",
    timestamp: "2026-07-31T00:00:00.000Z",
    payment: { from: "0xNEWPARTY", amount: 500, direction: "out", fundsRef: "f" },
    verdict: { decision: "ESCALATE", signals: {}, rationale: "r" },
    outcome: "held_by_judgment",
    amountUnits: "500000000",
    ...overrides,
  };
}

beforeEach(() => {
  entries = [];
  learnedCounterparties.length = 0;
});

describe("approveHeldPayment", () => {
  it("settles on-chain and learns the counterparty when compliance passes", async () => {
    entries.push(heldEntry());
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 4, message: "ok" }),
      settle: vi.fn().mockResolvedValue("0xapproved"),
    };

    const { entry, approval } = await approveHeldPayment(MERCHANT_ID, "held-1", deps);

    expect(approval).toEqual({ status: "settled", txHash: "0xapproved", complianceCode: 4, complianceMessage: "ok" });
    expect(entry.resolution).toBe("approved");
    expect(entry.resolvedTxHash).toBe("0xapproved");
    expect(deps.settle).toHaveBeenCalledWith("0xNEWPARTY", 500000000n);
    expect(learnedCounterparties).toContain("0xNEWPARTY");
    expect(entries[0].resolution).toBe("approved");
  });

  it("clears a held inbound without sending funds back to its sender", async () => {
    entries.push(heldEntry({ payment: { from: "0xCUSTOMER", amount: 500, direction: "in", fundsRef: "0xinbound" } }));
    const deps = { verifyCompliance: vi.fn(), settle: vi.fn() };
    const { entry, approval } = await approveHeldPayment(MERCHANT_ID, "held-1", deps);
    expect(approval).toEqual({ status: "cleared" });
    expect(entry.resolution).toBe("approved");
    expect(deps.verifyCompliance).not.toHaveBeenCalled();
    expect(deps.settle).not.toHaveBeenCalled();
  });

  it("stays pending (not resolved) when Cleanverse still blocks the approval", async () => {
    entries.push(heldEntry());
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 3, message: "apass frozen" }),
      settle: vi.fn(),
    };

    const { approval } = await approveHeldPayment(MERCHANT_ID, "held-1", deps);

    expect(approval).toEqual({ status: "blocked_by_compliance", complianceCode: 3, complianceMessage: "apass frozen" });
    expect(deps.settle).not.toHaveBeenCalled();
    expect(entries[0].resolution).toBeUndefined();
  });

  it("refuses to re-approve an already-resolved entry", async () => {
    entries.push(heldEntry({ resolution: "approved" }));
    const deps = { verifyCompliance: vi.fn(), settle: vi.fn() };
    await expect(approveHeldPayment(MERCHANT_ID, "held-1", deps)).rejects.toThrow();
    expect(deps.verifyCompliance).not.toHaveBeenCalled();
  });

  it("refuses to approve an entry that already settled on its own", async () => {
    entries.push(heldEntry({ outcome: "settled", txHash: "0xoriginal" }));
    const deps = { verifyCompliance: vi.fn(), settle: vi.fn() };
    await expect(approveHeldPayment(MERCHANT_ID, "held-1", deps)).rejects.toThrow();
  });
});

describe("rejectHeldPayment", () => {
  it("marks a pending entry rejected without any chain or compliance call", async () => {
    entries.push(heldEntry());
    const entry = await rejectHeldPayment(MERCHANT_ID, "held-1");
    expect(entry.resolution).toBe("rejected");
    expect(entry.resolvedTxHash).toBeUndefined();
  });

  it("refuses to reject an already-resolved entry", async () => {
    entries.push(heldEntry({ resolution: "rejected" }));
    await expect(rejectHeldPayment(MERCHANT_ID, "held-1")).rejects.toThrow();
  });
});
