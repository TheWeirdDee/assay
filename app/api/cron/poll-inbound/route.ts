import { timingSafeEqual } from "node:crypto";
import { listAllMerchants } from "@/lib/merchants/store";
import { syncInboundPayments } from "@/lib/operator/inboundSync";

export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!expected || !supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const merchants = await listAllMerchants();
  const results = [];
  for (const merchant of merchants) {
    try {
      results.push({ merchantId: merchant.id, ok: true, ...(await syncInboundPayments(merchant)) });
    } catch (error) {
      results.push({ merchantId: merchant.id, ok: false, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }
  return Response.json({ processed: merchants.length, results, timestamp: new Date().toISOString() });
}
