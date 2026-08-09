import "server-only";
import { formatEther, formatUnits, type Address } from "viem";
import type { MerchantRow } from "../auth/dal";
import { erc20BalanceOf, erc20Decimals } from "../chain/erc20";
import { publicClient } from "../chain/monad";
import { verifyAPass } from "../cleanverse/client";
import { decryptMerchantCreds } from "./store";

export interface MerchantReadiness {
  identity: "ready" | "action_required" | "unavailable";
  identityMessage: string;
  gasBalance: string;
  tokenBalance: string;
  gasReady: boolean;
  tokenReady: boolean;
}

export async function getMerchantReadiness(merchant: MerchantRow): Promise<MerchantReadiness> {
  const address = merchant.merchant_wallet_address as Address;
  const token = merchant.atoken_address as Address;
  const credentials = decryptMerchantCreds(merchant);
  const [gasResult, tokenResult, decimalsResult, verificationResult] = await Promise.allSettled([
    publicClient.getBalance({ address }),
    erc20BalanceOf(token, address),
    erc20Decimals(token),
    verifyAPass("monad", token, address, {
      apiId: credentials.apiId,
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    }),
  ]);

  const gas = gasResult.status === "fulfilled" ? gasResult.value : 0n;
  const units = tokenResult.status === "fulfilled" ? tokenResult.value : 0n;
  const decimals = decimalsResult.status === "fulfilled" ? decimalsResult.value : 18;
  const verification = verificationResult.status === "fulfilled" ? verificationResult.value.data : undefined;

  return {
    // magickLink (the SumSub document-upload flow) is deliberately not surfaced here -- verification
    // goes through generate_apass (VerifyIdentityButton) instead, no ID/passport upload.
    identity: verification?.code === 4 ? "ready" : verification ? "action_required" : "unavailable",
    identityMessage: verification?.message || "Cleanverse verification is temporarily unavailable.",
    gasBalance: Number(formatEther(gas)).toFixed(4),
    tokenBalance: Number(formatUnits(units, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
    gasReady: gas > 0n,
    tokenReady: units > 0n,
  };
}
