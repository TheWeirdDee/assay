"use server";

import { z } from "zod";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { Hex } from "viem";
import { requireUser } from "@/lib/auth/dal";
import { createMerchant, decryptMerchantCreds, updateMerchantPolicy } from "@/lib/merchants/store";
import { generateAPass, type Chain } from "@/lib/cleanverse/client";
import { ASSAY_CHAIN, platformATokenAddress, platformCleanverseCreds } from "@/lib/cleanverse/platform";

// Real on-chain settlement (lib/chain/monad.ts) and inbound-transfer polling only implement Monad
// testnet today. Cleanverse itself is multi-chain, but offering the other eight chains here would
// silently fail at settlement time -- exactly the kind of gap this rebuild is trying to remove.
// Widening this requires a per-chain viem client (RPC URL + chain id), not just a new enum value.
const CreateMerchantSchema = z.object({
  name: z.string().min(2, { error: "Name is too short." }).max(80),
  solvencyRule: z.boolean(),
  anomalyTolerance: z.enum(["low", "medium", "high"]),
  escalateTo: z.string().min(1, { error: "Give an escalation contact (email or name)." }),
});

export type CreateMerchantState =
  | { error?: string; generatedPrivateKey?: string; generatedAddress?: string; merchantId?: string }
  | undefined;

export async function createMerchantAction(
  _prev: CreateMerchantState,
  formData: FormData,
): Promise<CreateMerchantState> {
  const user = await requireUser();

  const parsed = CreateMerchantSchema.safeParse({
    name: formData.get("name"),
    solvencyRule: formData.get("solvencyRule") === "on",
    anomalyTolerance: formData.get("anomalyTolerance"),
    escalateTo: formData.get("escalateTo"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const input = parsed.data;

  const privateKey: Hex = generatePrivateKey();
  const walletAddress = privateKeyToAccount(privateKey).address;
  const credentials = platformCleanverseCreds();
  const atokenAddress = platformATokenAddress();

  const merchant = await createMerchant({
    ownerUserId: user.id,
    name: input.name,
    chain: ASSAY_CHAIN as Chain,
    atokenAddress,
    cleanverseApiBaseUrl: credentials.baseUrl,
    cleanverseApiId: credentials.apiId,
    cleanverseApiKey: credentials.apiKey,
    merchantWalletAddress: walletAddress,
    merchantWalletPrivateKey: privateKey,
    policy: { solvencyRule: input.solvencyRule, anomalyTolerance: input.anomalyTolerance, escalateTo: input.escalateTo },
  });

  // Sandbox managed wallets are disclosed once so the owner can retain recovery control.
  return { generatedPrivateKey: privateKey, generatedAddress: walletAddress, merchantId: merchant.id };
}

const PolicySchema = z.object({
  solvencyRule: z.boolean(),
  anomalyTolerance: z.enum(["low", "medium", "high"]),
  escalateTo: z.string().min(1),
});

export async function updatePolicyAction(merchantId: string, formData: FormData): Promise<void> {
  const { requireMerchant } = await import("@/lib/auth/dal");
  await requireMerchant(merchantId);

  const parsed = PolicySchema.safeParse({
    solvencyRule: formData.get("solvencyRule") === "on",
    anomalyTolerance: formData.get("anomalyTolerance"),
    escalateTo: formData.get("escalateTo"),
  });
  if (!parsed.success) return;

  await updateMerchantPolicy(merchantId, parsed.data);
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/app/${merchantId}/settings`);
  revalidatePath(`/app/${merchantId}`);
}

export interface GenerateApassActionResult {
  ok: boolean;
  message: string;
}

/**
 * Issues a Cleanverse A-Pass for this merchant's managed wallet via the generate_apass API --
 * the organizer-confirmed alternative to the SumSub document-upload magic-link. No ID/passport
 * is collected or transmitted; generate_apass takes only customerId + wallet + expiry.
 */
export async function generateApassAction(merchantId: string): Promise<GenerateApassActionResult> {
  const { requireMerchant } = await import("@/lib/auth/dal");
  const { merchant } = await requireMerchant(merchantId);
  const credentials = decryptMerchantCreds(merchant);

  try {
    const result = await generateAPass(
      {
        customerId: `ASSAY${merchant.merchant_wallet_address.slice(2, 18)}`,
        expirationTime: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
        wallet: { address: merchant.merchant_wallet_address, chain: merchant.chain as Chain },
      },
      { apiId: credentials.apiId, apiKey: credentials.apiKey, baseUrl: credentials.baseUrl },
    );

    if (result.code !== "0000") {
      return { ok: false, message: result.message || `Cleanverse rejected the request (code ${result.code}).` };
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/app/${merchantId}`);
    return { ok: true, message: `A-Pass issued — tier ${result.data.tier}. Refreshing workspace status.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "generate_apass request failed." };
  }
}
