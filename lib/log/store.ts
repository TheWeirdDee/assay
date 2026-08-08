/** Decision log, Postgres-backed, scoped per merchant. Disclosable/exportable to an auditor. */
import "server-only";
import { sql } from "../db/client";
import type { DecisionLogEntry } from "./types";

interface DecisionRow {
  id: string;
  ts: Date;
  payment: DecisionLogEntry["payment"];
  verdict: DecisionLogEntry["verdict"];
  outcome: DecisionLogEntry["outcome"];
  amount_units: string;
  tx_hash: string | null;
  compliance_code: number | null;
  compliance_message: string | null;
  resolution: "approved" | "rejected" | null;
  resolved_at: Date | null;
  resolved_tx_hash: string | null;
  audit_report_url: string | null;
  source_tx_hash: string | null;
}

function toEntry(row: DecisionRow): DecisionLogEntry {
  return {
    id: row.id,
    timestamp: row.ts.toISOString(),
    payment: row.payment,
    verdict: row.verdict,
    outcome: row.outcome,
    amountUnits: row.amount_units,
    ...(row.tx_hash ? { txHash: row.tx_hash } : {}),
    ...(row.compliance_code !== null ? { complianceCode: row.compliance_code } : {}),
    ...(row.compliance_message ? { complianceMessage: row.compliance_message } : {}),
    ...(row.audit_report_url ? { auditReportUrl: row.audit_report_url } : {}),
    ...(row.resolution ? { resolution: row.resolution } : {}),
    ...(row.resolved_at ? { resolvedAt: row.resolved_at.toISOString() } : {}),
    ...(row.resolved_tx_hash ? { resolvedTxHash: row.resolved_tx_hash } : {}),
    ...(row.source_tx_hash ? { sourceTxHash: row.source_tx_hash } : {}),
  };
}

export async function listDecisions(merchantId: string): Promise<DecisionLogEntry[]> {
  const rows = await sql<DecisionRow[]>`
    select * from decisions where merchant_id = ${merchantId} order by ts desc
  `;
  return rows.map(toEntry);
}

/**
 * Inserts a decision entry. If sourceTxHash is set (an inbound transfer discovered by the poller) and
 * that tx has already been logged for this merchant, the insert is a no-op -- returns null so the
 * caller knows not to double-count it.
 */
export async function appendDecision(
  merchantId: string,
  entry: Omit<DecisionLogEntry, "id" | "timestamp">,
): Promise<DecisionLogEntry | null> {
  const rows = await sql<DecisionRow[]>`
    insert into decisions (
      merchant_id, payment, verdict, outcome, amount_units,
      tx_hash, compliance_code, compliance_message, source_tx_hash, audit_report_url
    ) values (
      ${merchantId}, ${JSON.stringify(entry.payment)}::jsonb, ${JSON.stringify(entry.verdict)}::jsonb, ${entry.outcome}, ${entry.amountUnits},
      ${entry.txHash ?? null}, ${entry.complianceCode ?? null}, ${entry.complianceMessage ?? null},
      ${entry.sourceTxHash ?? null}, ${entry.auditReportUrl ?? null}
    )
    on conflict (merchant_id, source_tx_hash) where source_tx_hash is not null do nothing
    returning *
  `;
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function updateDecision(
  merchantId: string,
  id: string,
  patch: Partial<
    Pick<
      DecisionLogEntry,
      "resolution" | "resolvedAt" | "resolvedTxHash" | "complianceCode" | "complianceMessage" | "auditReportUrl"
    >
  >,
): Promise<DecisionLogEntry | undefined> {
  const rows = await sql<DecisionRow[]>`
    update decisions set
      resolution = coalesce(${patch.resolution ?? null}, resolution),
      resolved_at = coalesce(${patch.resolvedAt ?? null}, resolved_at),
      resolved_tx_hash = coalesce(${patch.resolvedTxHash ?? null}, resolved_tx_hash),
      compliance_code = coalesce(${patch.complianceCode ?? null}, compliance_code),
      compliance_message = coalesce(${patch.complianceMessage ?? null}, compliance_message),
      audit_report_url = coalesce(${patch.auditReportUrl ?? null}, audit_report_url)
    where id = ${id} and merchant_id = ${merchantId}
    returning *
  `;
  return rows[0] ? toEntry(rows[0]) : undefined;
}

export async function getDecision(merchantId: string, id: string): Promise<DecisionLogEntry | undefined> {
  const rows = await sql<DecisionRow[]>`
    select * from decisions where id = ${id} and merchant_id = ${merchantId}
  `;
  return rows[0] ? toEntry(rows[0]) : undefined;
}
