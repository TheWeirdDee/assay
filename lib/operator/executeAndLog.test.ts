import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Baseline, MerchantPolicy } from "../judgment/engine";
import type { DecisionLogEntry } from "../log/types";

vi.mock("../judgment/llm", () => ({
  generateLLMRationale: vi.fn().mockResolvedValue(undefined),
}));

const appendDecisionMock = vi.fn(async (merchantId: string, entry: Omit<DecisionLogEntry, "id" | "timestamp">) => ({
  id: "generated-id",
  timestamp: "2026-07-31T00:00:00.000Z",
  ...entry,
}));
vi.mock("../log/store", () => ({
  appendDecision: (...args: Parameters<typeof appendDecisionMock>) => appendDecisionMock(...args),
}));

const { executeAndLog } = await import("./executeAndLog");

const baseline: Baseline = {
  amountMean: 1000,
  amountStd: 400,
  knownCounterparties: new Set(["0xTRUSTED"]),
  clearedInflows: 100000n,
  committedOutflows: 0n,
};
const policy: MerchantPolicy = { solvencyRule: true, anomalyTolerance: "medium", escalateTo: "merchant" };
const MERCHANT_ID = "merchant-1";

beforeEach(() => {
  appendDecisionMock.mockClear();
});

describe("executeAndLog", () => {
  it("writes a settled entry with txHash when both gates open", async () => {
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 4, message: "ok" }),
      settle: vi.fn().mockResolvedValue("0xsettled"),
    };
    const { entry } = await executeAndLog(
      MERCHANT_ID,
      { from: "0xTRUSTED", amount: 1100, direction: "in", fundsRef: "x" },
      baseline,
      policy,
      1100n,
      deps,
    );
    expect(entry?.outcome).toBe("settled");
    expect(entry?.txHash).toBe("0xsettled");
    expect(appendDecisionMock).toHaveBeenCalledWith(MERCHANT_ID, expect.objectContaining({ outcome: "settled", txHash: "0xsettled" }));
  });

  it("keeps and logs a confirmed settlement when report enrichment throws", async () => {
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 4, message: "ok" }),
      settle: vi.fn().mockResolvedValue("0xsettled"),
      getAuditReport: vi.fn().mockRejectedValue(new Error("not indexed")),
    };
    const { outcome, entry } = await executeAndLog(
      MERCHANT_ID,
      { from: "0xTRUSTED", amount: 1100, direction: "out", fundsRef: "report-fail" },
      baseline,
      policy,
      1100n,
      deps,
    );
    expect(outcome.status).toBe("settled");
    expect(entry?.txHash).toBe("0xsettled");
    expect(entry?.auditReportUrl).toBeUndefined();
  });

  it("writes a held entry with no txHash and no compliance call when judgment holds", async () => {
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 4, message: "ok" }),
      settle: vi.fn().mockResolvedValue("0xshouldnothappen"),
    };
    const { entry } = await executeAndLog(
      MERCHANT_ID,
      { from: "0xNEWPARTY", amount: 5000, direction: "in", fundsRef: "y" },
      baseline,
      policy,
      5000n,
      deps,
    );
    expect(entry?.outcome).toBe("held_by_judgment");
    expect(entry?.txHash).toBeUndefined();
    expect(deps.verifyCompliance).not.toHaveBeenCalled();
  });

  it("writes a blocked_by_compliance entry with the compliance code/message, fail-closed", async () => {
    const deps = {
      verifyCompliance: vi.fn().mockResolvedValue({ code: 3, message: "apass frozen" }),
      settle: vi.fn(),
    };
    const { entry } = await executeAndLog(
      MERCHANT_ID,
      { from: "0xTRUSTED", amount: 1100, direction: "in", fundsRef: "z" },
      baseline,
      policy,
      1100n,
      deps,
    );
    expect(entry?.outcome).toBe("blocked_by_compliance");
    expect(entry?.complianceCode).toBe(3);
    expect(entry?.complianceMessage).toBe("apass frozen");
    expect(deps.settle).not.toHaveBeenCalled();
  });
});
