/** Wires execute.ts's injectable deps to the real Cleanverse client + real on-chain settlement. */
import { downloadTravelRule, queryAPass, verifyAPass, type Chain, type CleanverseCreds } from "../cleanverse/client";
import { erc20Transfer } from "../chain/erc20";
import type { ExecuteDeps } from "./execute";
import type { Address, Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export function liveExecuteDeps(
  chain: Chain,
  tokenAddress: Address,
  senderPrivateKey: Hex,
  creds: CleanverseCreds,
): ExecuteDeps {
  const sender = privateKeyToAccount(senderPrivateKey).address;
  return {
    verifyCompliance: async (counterparty) => {
      const res = await verifyAPass(chain, tokenAddress, counterparty, creds);
      return { code: res.data.code, message: res.data.message };
    },
    settle: async (counterparty, amount) => {
      return erc20Transfer(tokenAddress, counterparty as Address, amount, senderPrivateKey);
    },
    getAuditReport: async (counterparty, txHash) => {
      try {
        const identity = await queryAPass(chain, counterparty, creds);
        const report = await downloadTravelRule({ cvRecordId: identity.data.cvRecordId, txHash, wallet: { chain, address: sender } }, creds);
        return report.data.downloadUrl;
      } catch {
        // Cleanverse may not have indexed a freshly-confirmed transaction yet. The decision remains
        // valid and the report can be refreshed later; settlement must not be reported as failed.
        return undefined;
      }
    },
  };
}
