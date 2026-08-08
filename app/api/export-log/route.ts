import { NextResponse } from "next/server";
import { requireMerchant } from "@/lib/auth/dal";
import { listDecisions } from "@/lib/log/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const merchantId = searchParams.get("merchantId");
  if (!merchantId) {
    return new NextResponse("Missing merchantId", { status: 400 });
  }

  // Verifies the session AND that this user owns the merchant -- redirects to /app on failure,
  // which is fine for a direct link click but means a bare fetch() gets a 3xx, not a 401. Good
  // enough for this download-link surface; a JSON API consumer should use its own auth check.
  await requireMerchant(merchantId);
  const entries = await listDecisions(merchantId);

  if (format === "csv") {
    const headers = ["ID", "Timestamp", "Counterparty", "Direction", "Amount", "Decision", "Outcome", "ComplianceCode", "TxHash", "Rationale"];
    const rows = entries.map((e) => [
      e.id,
      e.timestamp,
      e.payment.from,
      e.payment.direction,
      e.payment.amount,
      e.verdict.decision,
      e.resolution ? `approved (${e.resolution})` : e.outcome,
      e.complianceCode ?? "N/A",
      e.resolvedTxHash || e.txHash || "N/A",
      `"${e.verdict.rationale.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="assay-audit-log.csv"',
      },
    });
  }

  return new NextResponse(JSON.stringify(entries, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="assay-audit-log.json"',
    },
  });
}
