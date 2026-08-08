/**
 * Integration test against a real Postgres database -- decision storage now lives in Postgres, not
 * a file, so correctness means the SQL is correct, not that a mock was called correctly. Skips
 * automatically when DATABASE_URL isn't set (e.g. a contributor without a DB configured yet).
 */
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { DecisionLogEntry } from "./types";

const hasDb = !!process.env.DATABASE_URL;
const d = describe.skipIf(!hasDb);

function entry(overrides: Partial<Omit<DecisionLogEntry, "id" | "timestamp">> = {}): Omit<DecisionLogEntry, "id" | "timestamp"> {
  return {
    payment: { from: "0xTRUSTED", amount: 100, direction: "out", fundsRef: "f1" },
    verdict: { decision: "ALLOW", signals: {}, rationale: "within range" },
    outcome: "settled",
    amountUnits: "100000000",
    txHash: "0xabc",
    ...overrides,
  };
}

d("decision log store", () => {
  let sql: typeof import("../db/client").sql;
  let merchantId: string;

  beforeAll(async () => {
    ({ sql } = await import("../db/client"));
    const email = `store-test-${randomUUID()}@example.com`;
    const [user] = await sql<{ id: string }[]>`
      insert into users (email, password_hash) values (${email}, 'x') returning id
    `;
    const [merchant] = await sql<{ id: string }[]>`
      insert into merchants (
        owner_user_id, name, chain, atoken_address, cleanverse_api_id_enc, cleanverse_api_key_enc,
        merchant_wallet_address, merchant_wallet_private_key_enc
      ) values (
        ${user.id}, 'Test Merchant', 'monad', '0x0000000000000000000000000000000000000001', 'enc', 'enc',
        '0x0000000000000000000000000000000000000002', 'enc'
      ) returning id
    `;
    merchantId = merchant.id;
  });

  afterAll(async () => {
    await sql`delete from merchants where id = ${merchantId}`;
    await sql.end();
  });

  it("returns an empty list for a merchant with no decisions", async () => {
    const { listDecisions } = await import("./store");
    expect(await listDecisions(merchantId)).toEqual([]);
  });

  it("round-trips appended entries, newest first", async () => {
    const { appendDecision, listDecisions } = await import("./store");
    await appendDecision(merchantId, entry());
    await appendDecision(merchantId, entry({ outcome: "held_by_judgment", txHash: undefined }));
    const all = await listDecisions(merchantId);
    expect(all).toHaveLength(2);
    expect(all[0].outcome).toBe("held_by_judgment");
  });

  it("dedupes inbound transfers by sourceTxHash per merchant", async () => {
    const { appendDecision, listDecisions } = await import("./store");
    const dedupeTxHash = `0xdedupe-${randomUUID()}`;
    const first = await appendDecision(merchantId, entry({ sourceTxHash: dedupeTxHash }));
    const second = await appendDecision(merchantId, entry({ sourceTxHash: dedupeTxHash }));
    expect(first).not.toBeNull();
    expect(second).toBeNull();
    const all = await listDecisions(merchantId);
    expect(all.filter((e) => e.sourceTxHash === dedupeTxHash)).toHaveLength(1);
  });

  it("patches an entry's resolution by id, scoped to the merchant", async () => {
    const { appendDecision, updateDecision } = await import("./store");
    const created = await appendDecision(merchantId, entry({ outcome: "held_by_judgment", txHash: undefined }));
    const updated = await updateDecision(merchantId, created!.id, {
      resolution: "approved",
      resolvedTxHash: "0xapproved",
    });
    expect(updated?.resolution).toBe("approved");
    expect(updated?.resolvedTxHash).toBe("0xapproved");
  });
});
