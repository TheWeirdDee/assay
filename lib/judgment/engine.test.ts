import { describe, expect, it } from "vitest";
import { type Baseline, type MerchantPolicy, judge, proofIdenticalAmountsDifferentDecisions } from "./engine";

const baseline: Baseline = {
  amountMean: 1000,
  amountStd: 400,
  knownCounterparties: new Set(["0xTRUSTED"]),
  clearedInflows: 100000n,
  committedOutflows: 0n,
};

const policy: MerchantPolicy = { solvencyRule: true, anomalyTolerance: "medium", escalateTo: "merchant" };

describe("judge — anti-wrapper proof", () => {
  it("gives OPPOSITE decisions to two payments of the IDENTICAL amount", () => {
    const { trusted, newParty } = proofIdenticalAmountsDifferentDecisions();
    expect(trusted.decision).toBe("ALLOW");
    expect(newParty.decision).toBe("ESCALATE");
    expect(trusted.decision).not.toBe(newParty.decision);
  });
});

describe("judge — signals", () => {
  it("allows a payment within the normal range from a known counterparty", () => {
    const v = judge({ from: "0xTRUSTED", amount: 1100, direction: "in", fundsRef: "a" }, baseline, policy);
    expect(v.decision).toBe("ALLOW");
  });

  it("allows a large payment from a known counterparty (size alone is not disqualifying)", () => {
    const v = judge({ from: "0xTRUSTED", amount: 5000, direction: "in", fundsRef: "b" }, baseline, policy);
    expect(v.decision).toBe("ALLOW");
  });

  it("escalates a large payment from a brand-new counterparty", () => {
    const v = judge({ from: "0xNEWPARTY", amount: 5000, direction: "in", fundsRef: "c" }, baseline, policy);
    expect(v.decision).toBe("ESCALATE");
  });

  it("holds an outbound payment that would breach solvency, regardless of amount or anomaly", () => {
    const v = judge(
      { from: "0xTRUSTED", amount: 500, direction: "out", fundsRef: "d" },
      { ...baseline, committedOutflows: 99700n },
      policy,
    );
    expect(v.decision).toBe("HOLD");
  });

  it("solvency breach takes priority even for a known, in-range counterparty", () => {
    const v = judge(
      { from: "0xTRUSTED", amount: 1000, direction: "out", fundsRef: "e" },
      { ...baseline, clearedInflows: 500n, committedOutflows: 0n },
      policy,
    );
    expect(v.decision).toBe("HOLD");
  });

  it("never overrides on inbound funds (solvency check is n/a for inbound)", () => {
    const v = judge(
      { from: "0xTRUSTED", amount: 1000, direction: "in", fundsRef: "f" },
      { ...baseline, clearedInflows: 0n, committedOutflows: 500n },
      policy,
    );
    expect(v.decision).toBe("ALLOW");
  });

  it("respects per-merchant anomaly tolerance (high tolerance allows what medium would escalate)", () => {
    // amount 2200 -> z = 3.0: exceeds medium tolerance (2.5) but not high tolerance (3.5)
    const strict = judge({ from: "0xNEWPARTY", amount: 2200, direction: "in", fundsRef: "g1" }, baseline, policy);
    expect(strict.decision).toBe("ESCALATE");

    const loose: MerchantPolicy = { ...policy, anomalyTolerance: "high" };
    const v = judge({ from: "0xNEWPARTY", amount: 2200, direction: "in", fundsRef: "g2" }, baseline, loose);
    expect(v.decision).toBe("ALLOW");
  });

  it("every verdict carries a non-empty human-readable rationale", () => {
    const v = judge({ from: "0xNEWPARTY", amount: 5000, direction: "in", fundsRef: "h" }, baseline, policy);
    expect(v.rationale.length).toBeGreaterThan(0);
    expect(v.rationale).toContain("$5000");
  });
});
