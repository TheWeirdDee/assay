import "server-only";
import { formatEther, formatUnits, type Address } from "viem";
import type { MerchantRow } from "../auth/dal";
import { erc20BalanceOf, erc20Decimals } from "../chain/erc20";
import { publicClient } from "../chain/monad";
import { queryAPass } from "../cleanverse/client";
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

  const [gasResult, tokenResult, decimalsResult, identityResult] = await Promise.allSettled([
    publicClient.getBalance({ address }),
    erc20BalanceOf(token, address),
    erc20Decimals(token),
    // A-Pass (CVI) is a wallet-level credential, independent of any specific A-Token -- query_apass
    // is the check for it. verify_apass is scoped per A-Token (its data.code === 1 means "this
    // atoken address wasn't recognized", not "this wallet has no A-Pass") -- using it here reads
    // an unrelated token-lookup failure as an identity failure. verify_apass's per-token result
    // belongs to a specific transfer attempt and is already shown in the Compliance panel.
    queryAPass("monad", address, {
      apiId: credentials.apiId,
      apiKey: credentials.apiKey,
      baseUrl: credentials.baseUrl,
    }),
  ]);

  const gas = gasResult.status === "fulfilled" ? gasResult.value : 0n;
  const units = tokenResult.status === "fulfilled" ? tokenResult.value : 0n;
  const decimals = decimalsResult.status === "fulfilled" ? decimalsResult.value : 18;

  let identity: MerchantReadiness["identity"] = "unavailable";
  let identityMessage = "Cleanverse identity check is temporarily unavailable.";
  if (identityResult.status === "fulfilled") {
    const envelope = identityResult.value;
    if (envelope.code === "0000" && envelope.data) {
      const pass = envelope.data;
      if (pass.status === 1) {
        identity = "ready";
        identityMessage = `A-Pass active — tier ${pass.tier}, expires ${new Date(pass.expirationTime * 1000).toLocaleDateString()}.`;
      } else {
        identity = "action_required";
        identityMessage = `A-Pass exists (tier ${pass.tier}) but is frozen.`;
      }
    } else {
      // No fabricated "verified" on ambiguity -- surface whatever Cleanverse actually said (e.g.
      // no A-Pass record yet, or a malformed-request error) rather than guessing at the cause.
      identity = "action_required";
      identityMessage = envelope.message || "No A-Pass found for this wallet yet.";
    }
  }

  return {
    identity,
    identityMessage,
    gasBalance: Number(formatEther(gas)).toFixed(4),
    tokenBalance: Number(formatUnits(units, decimals)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
    gasReady: gas > 0n,
    tokenReady: units > 0n,
  };
}
