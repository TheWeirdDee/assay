/**
 * Real inbound-payment handling: polls the merchant's A-Token balance for new Transfer events (see
 * lib/chain/inboundLogs.ts), judges each one, and logs the outcome. There is no Cleanverse escrow
 * primitive, so an inbound HOLD/ESCALATE is a ledger status (funds already arrived on-chain, not
 * something Assay can un-receive) rather than a blocked transfer -- the UI must say so honestly.
 * Compliance is implicit for anything that landed: the A-Token contract only allows transfers between
 * A-Pass-verified wallets, so a successfully-arrived transfer already passed that gate. We still
 * fetch verify_apass for the audit record, best-effort.
 */
import "server-only";
import type { Address } from "viem";
import { findInboundTransfers } from "../chain/inboundLogs";
import { erc20Decimals } from "../chain/erc20";
import { verifyAPass, type Chain } from "../cleanverse/client";
import { judge, type Payment } from "../judgment/engine";
import { generateLLMRationale } from "../judgment/llm";
import { appendDecision } from "../log/store";
import { loadBaseline, recordInflow } from "../baseline/store";
import { decryptMerchantCreds, merchantPolicy, updateLastSyncedBlock } from "../merchants/store";
import type { MerchantRow } from "../auth/dal";
import { publicClient } from "../chain/monad";

export interface InboundSyncResult {
  discovered: number;
  logged: number;
}

export async function syncInboundPayments(merchant: MerchantRow): Promise<InboundSyncResult> {
  const creds = decryptMerchantCreds(merchant);
  const chain = merchant.chain as Chain;
  const tokenAddress = merchant.atoken_address as Address;
  const walletAddress = merchant.merchant_wallet_address as Address;
  const fromBlock = BigInt(merchant.last_synced_block) + 1n;
  const latestBlock = await publicClient.getBlockNumber();

  const transfers = await findInboundTransfers(tokenAddress, walletAddress, fromBlock);
  if (transfers.length === 0) {
    if (latestBlock >= fromBlock) await updateLastSyncedBlock(merchant.id, latestBlock);
    return { discovered: 0, logged: 0 };
  }

  const decimals = await erc20Decimals(tokenAddress);
  const policy = merchantPolicy(merchant);
  let maxBlock = latestBlock;
  let logged = 0;

  for (const transfer of transfers) {
    if (transfer.blockNumber > maxBlock) maxBlock = transfer.blockNumber;

    const baseline = await loadBaseline(merchant.id);
    const amount = Number(transfer.amountUnits) / 10 ** decimals;
    const payment: Payment = { from: transfer.from, amount, direction: "in", fundsRef: transfer.txHash };
    const verdict = judge(payment, baseline, policy);

    const compliance = await verifyAPass(chain, tokenAddress, transfer.from, {
      apiId: creds.apiId,
      apiKey: creds.apiKey,
      baseUrl: creds.baseUrl,
    }).catch(() => null);

    const llmSummary = await generateLLMRationale({
      payment,
      decision: verdict.decision,
      signals: verdict.signals,
      riskLevel: verdict.riskLevel,
      policy,
    });

    const entry = await appendDecision(merchant.id, {
      payment,
      verdict: llmSummary ? { ...verdict, llmSummary } : verdict,
      outcome: verdict.decision === "ALLOW" ? "settled" : "held_by_judgment",
      amountUnits: transfer.amountUnits.toString(),
      ...(verdict.decision === "ALLOW" ? { txHash: transfer.txHash } : {}),
      ...(compliance ? { complianceCode: compliance.data.code, complianceMessage: compliance.data.message } : {}),
      sourceTxHash: transfer.txHash,
    });

    if (entry) {
      logged += 1;
      if (verdict.decision === "ALLOW") await recordInflow(merchant.id, amount);
    }
  }

  await updateLastSyncedBlock(merchant.id, maxBlock);
  return { discovered: transfers.length, logged };
}
