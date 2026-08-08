/** Per-merchant learned baseline, Postgres-backed (table `baselines`, one row per merchant, seeded on create). */
import "server-only";
import { sql } from "../db/client";
import type { Baseline } from "../judgment/engine";

interface BaselineRow {
  amount_mean: number;
  amount_std: number;
  known_counterparties: string[];
  cleared_inflows: string;
  committed_outflows: string;
}

function toBaseline(row: BaselineRow): Baseline {
  return {
    amountMean: row.amount_mean,
    amountStd: row.amount_std,
    knownCounterparties: new Set(row.known_counterparties),
    clearedInflows: BigInt(row.cleared_inflows),
    committedOutflows: BigInt(row.committed_outflows),
  };
}

export async function loadBaseline(merchantId: string): Promise<Baseline> {
  const rows = await sql<BaselineRow[]>`
    select amount_mean, amount_std, known_counterparties, cleared_inflows, committed_outflows
    from baselines where merchant_id = ${merchantId}
  `;
  if (!rows[0]) {
    throw new Error(`No baseline row for merchant ${merchantId} -- was it created via createMerchant()?`);
  }
  return toBaseline(rows[0]);
}

/** The feedback loop: an approved counterparty becomes known, so the same pattern won't re-escalate. */
export async function learnCounterparty(merchantId: string, address: string): Promise<void> {
  await sql`
    update baselines
    set known_counterparties = (
      select coalesce(jsonb_agg(distinct value), '[]'::jsonb)
      from jsonb_array_elements_text(known_counterparties || to_jsonb(${address}::text)) as value
    ),
    updated_at = now()
    where merchant_id = ${merchantId}
  `;
}

export async function recordInflow(merchantId: string, amount: number): Promise<void> {
  await sql`
    update baselines set cleared_inflows = cleared_inflows + ${Math.round(amount)}, updated_at = now()
    where merchant_id = ${merchantId}
  `;
}

export async function recordOutflow(merchantId: string, amount: number): Promise<void> {
  await sql`
    update baselines set committed_outflows = committed_outflows + ${Math.round(amount)}, updated_at = now()
    where merchant_id = ${merchantId}
  `;
}
