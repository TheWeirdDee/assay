"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { parseUnits, type Address, type Hex } from "viem";
import { requireMerchant, type MerchantRow } from "@/lib/auth/dal";
import { decryptMerchantCreds, merchantPolicy } from "@/lib/merchants/store";
import { loadBaseline, recordInflow, recordOutflow } from "@/lib/baseline/store";
import { erc20Decimals } from "@/lib/chain/erc20";
import type { Chain } from "@/lib/cleanverse/client";
import { liveExecuteDeps } from "@/lib/operator/live";
import type { ExecuteDeps } from "@/lib/operator/execute";
import { executeAndLog } from "@/lib/operator/executeAndLog";
import { approveHeldPayment, rejectHeldPayment } from "@/lib/operator/resolve";
import { syncInboundPayments } from "@/lib/operator/inboundSync";

function depsFor(merchant: MerchantRow): ExecuteDeps {
  const creds = decryptMerchantCreds(merchant);
  return liveExecuteDeps(
    merchant.chain as Chain,
    merchant.atoken_address as Address,
    creds.walletPrivateKey as Hex,
    { apiId: creds.apiId, apiKey: creds.apiKey, baseUrl: creds.baseUrl },
  );
}

const PayoutSchema = z.object({
  counterparty: z.string().regex(/^0x[a-fA-F0-9]{40}$/, { error: "Not a valid wallet address." }),
  amount: z.string().regex(/^\d+(\.\d+)?$/, { error: "Enter a positive decimal amount." }),
});

export type PayoutState = { error?: string; result?: string } | undefined;

export async function createPayoutAction(
  merchantId: string,
  _prev: PayoutState,
  formData: FormData,
): Promise<PayoutState> {
  const { merchant } = await requireMerchant(merchantId);

  const parsed = PayoutSchema.safeParse({
    counterparty: formData.get("counterparty"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { counterparty, amount: amountText } = parsed.data;

  try {
    const decimals = await erc20Decimals(merchant.atoken_address as Address);
    const amountUnits = parseUnits(amountText, decimals);
    if (amountUnits <= 0n) return { error: "Amount must be positive." };
    const amount = Number(amountText);
    const baseline = await loadBaseline(merchant.id);
    const policy = merchantPolicy(merchant);

    const { outcome } = await executeAndLog(
      merchant.id,
      { from: counterparty, amount, direction: "out", fundsRef: `payout-${Date.now()}` },
      baseline,
      policy,
      amountUnits,
      depsFor(merchant),
    );

    if (outcome.status === "settled") {
      await recordOutflow(merchant.id, amount);
      revalidatePath(`/app/${merchantId}`);
      return { result: `Settled — tx ${outcome.txHash}` };
    }
    if (outcome.status === "blocked_by_compliance") {
      revalidatePath(`/app/${merchantId}`);
      return { result: `Blocked by Cleanverse compliance: ${outcome.complianceMessage}` };
    }
    revalidatePath(`/app/${merchantId}`);
    return { result: `${outcome.verdict.decision}: ${outcome.verdict.rationale}` };
  } catch (err) {
    return { error: `Payout failed: ${(err as Error).message}` };
  }
}

export async function syncInboundAction(merchantId: string): Promise<void> {
  const { merchant } = await requireMerchant(merchantId);
  await syncInboundPayments(merchant);
  revalidatePath(`/app/${merchantId}`);
}

export async function approveDecisionAction(merchantId: string, entryId: string): Promise<void> {
  const { merchant } = await requireMerchant(merchantId);
  try {
    const { approval, entry } = await approveHeldPayment(merchant.id, entryId, depsFor(merchant));
    if (approval.status === "cleared") await recordInflow(merchant.id, entry.payment.amount);
    if (approval.status === "settled") await recordOutflow(merchant.id, entry.payment.amount);
  } catch (err) {
    console.error(`[assay] approve failed for ${entryId}:`, err);
  }
  revalidatePath(`/app/${merchantId}`);
}

export async function rejectDecisionAction(merchantId: string, entryId: string): Promise<void> {
  const { merchant } = await requireMerchant(merchantId);
  await rejectHeldPayment(merchant.id, entryId);
  revalidatePath(`/app/${merchantId}`);
}
