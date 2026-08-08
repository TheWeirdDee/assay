import { describe, expect, it, vi } from "vitest";
import type { Baseline, MerchantPolicy } from "../judgment/engine";
import { executeOutboundPayment } from "./execute";

const baseline: Baseline = {
  amountMean: 1000,
  amountStd: 400,
  knownCounterparties: new Set(["0xTRUSTED"]),
  clearedInflows: 100000n,
  committedOutflows: 0n,
};

const policy: MerchantPolicy = { solvencyRule: true, anomalyTolerance: "medium", escalateTo: "merchant" };

function deps(overrides: Partial<{ complianceCode: number; complianceMessage: string; txHash: string }> = {}) {
  const verifyCompliance = vi.fn().mockResolvedValue({
    code: overrides.complianceCode ?? 4,
    message: overrides.complianceMessage ?? "apass verify success",
  });
  const settle = vi.fn().mockResolvedValue(overrides.txHash ?? "0xdeadbeef");
  return { verifyCompliance, settle };
}

describe("executeOutboundPayment", () => {
  it("holds without ever calling Cleanverse or settling, when judgment says HOLD", async () => {
    const d = deps();
    const outcome = await executeOutboundPayment(
      { from: "0xTRUSTED", amount: 500, direction: "out", fundsRef: "a" },
      { ...baseline, committedOutflows: 99700n }, // would breach solvency
      policy,
      500n,
      d,
    );
    expect(outcome.status).toBe("held_by_judgment");
    expect(d.verifyCompliance).not.toHaveBeenCalled();
    expect(d.settle).not.toHaveBeenCalled();
  });

  it("escalates without touching Cleanverse or the chain, when judgment says ESCALATE", async () => {
    const d = deps();
    const outcome = await executeOutboundPayment(
      { from: "0xNEWPARTY", amount: 5000, direction: "in", fundsRef: "b" },
      baseline,
      policy,
      5000n,
      d,
    );
    expect(outcome.status).toBe("held_by_judgment");
    if (outcome.status === "held_by_judgment") expect(outcome.verdict.decision).toBe("ESCALATE");
    expect(d.verifyCompliance).not.toHaveBeenCalled();
    expect(d.settle).not.toHaveBeenCalled();
  });

  it("settles on-chain only after BOTH judgment ALLOW and Cleanverse compliance pass", async () => {
    const d = deps({ txHash: "0xabc123" });
    const outcome = await executeOutboundPayment(
      { from: "0xTRUSTED", amount: 1100, direction: "in", fundsRef: "c" },
      baseline,
      policy,
      1100n,
      d,
    );
    expect(outcome.status).toBe("settled");
    if (outcome.status === "settled") expect(outcome.txHash).toBe("0xabc123");
    expect(d.verifyCompliance).toHaveBeenCalledWith("0xTRUSTED");
    expect(d.settle).toHaveBeenCalledWith("0xTRUSTED", 1100n);
  });

  it("FAIL-CLOSED: a Cleanverse compliance block stops settlement even when judgment says ALLOW", async () => {
    const d = deps({ complianceCode: 3, complianceMessage: "apass frozen" });
    const outcome = await executeOutboundPayment(
      { from: "0xTRUSTED", amount: 1100, direction: "in", fundsRef: "d" },
      baseline,
      policy,
      1100n,
      d,
    );
    expect(outcome.status).toBe("blocked_by_compliance");
    if (outcome.status === "blocked_by_compliance") {
      expect(outcome.complianceCode).toBe(3);
      expect(outcome.verdict.decision).toBe("ALLOW"); // Assay's own judgment still says allow...
    }
    expect(d.settle).not.toHaveBeenCalled(); // ...but compliance is final, so funds never move.
  });
});
