import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_URL;
const d = describe.skipIf(!hasDb);

d("baseline store", () => {
  let sql: typeof import("../db/client").sql;
  let merchantId: string;

  beforeAll(async () => {
    ({ sql } = await import("../db/client"));
    const email = `baseline-test-${randomUUID()}@example.com`;
    const [user] = await sql<{ id: string }[]>`
      insert into users (email, password_hash) values (${email}, 'x') returning id
    `;
    const [merchant] = await sql<{ id: string }[]>`
      insert into merchants (
        owner_user_id, name, chain, atoken_address, cleanverse_api_id_enc, cleanverse_api_key_enc,
        merchant_wallet_address, merchant_wallet_private_key_enc
      ) values (
        ${user.id}, 'Baseline Test Merchant', 'monad', '0x0000000000000000000000000000000000000001', 'enc', 'enc',
        '0x0000000000000000000000000000000000000002', 'enc'
      ) returning id
    `;
    merchantId = merchant.id;
    await sql`insert into baselines (merchant_id) values (${merchantId})`;
  });

  afterAll(async () => {
    await sql`delete from merchants where id = ${merchantId}`;
    await sql.end();
  });

  it("seeds the default baseline for a new merchant", async () => {
    const { loadBaseline } = await import("./store");
    const baseline = await loadBaseline(merchantId);
    expect(baseline.amountMean).toBe(100);
    expect(baseline.amountStd).toBe(40);
    expect(baseline.knownCounterparties.size).toBe(0);
  });

  it("records inflows/outflows and learns counterparties", async () => {
    const { loadBaseline, recordInflow, recordOutflow, learnCounterparty } = await import("./store");
    await recordInflow(merchantId, 250);
    await recordOutflow(merchantId, 40);
    await learnCounterparty(merchantId, "0xTRUSTED");
    await learnCounterparty(merchantId, "0xTRUSTED"); // idempotent

    const baseline = await loadBaseline(merchantId);
    expect(baseline.clearedInflows).toBe(250n);
    expect(baseline.committedOutflows).toBe(40n);
    expect([...baseline.knownCounterparties]).toEqual(["0xTRUSTED"]);
  });
});
