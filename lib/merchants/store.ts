import "server-only";
import { sql } from "../db/client";
import { encryptSecret, decryptSecret } from "../security/encryption";
import type { MerchantRow } from "../auth/dal";
import type { Chain } from "../cleanverse/client";
import type { MerchantPolicy } from "../judgment/engine";
import { publicClient } from "../chain/monad";

export interface CreateMerchantInput {
  ownerUserId: string;
  name: string;
  chain: Chain;
  atokenAddress: string;
  cleanverseApiBaseUrl: string;
  cleanverseApiId: string;
  cleanverseApiKey: string;
  merchantWalletAddress: string;
  merchantWalletPrivateKey: string;
  policy: MerchantPolicy;
}

export async function createMerchant(input: CreateMerchantInput): Promise<MerchantRow> {
  // Seed at the current chain height so the first inbound sync scans forward from "now", not from
  // genesis -- a merchant created today shouldn't trigger a multi-million-block getLogs scan.
  const startBlock = await publicClient.getBlockNumber();

  const rows = await sql<MerchantRow[]>`
    insert into merchants (
      owner_user_id, name, chain, atoken_address, cleanverse_api_base_url,
      cleanverse_api_id_enc, cleanverse_api_key_enc,
      merchant_wallet_address, merchant_wallet_private_key_enc,
      policy_solvency_rule, policy_anomaly_tolerance, policy_escalate_to, last_synced_block
    ) values (
      ${input.ownerUserId}, ${input.name}, ${input.chain}, ${input.atokenAddress}, ${input.cleanverseApiBaseUrl},
      ${encryptSecret(input.cleanverseApiId)}, ${encryptSecret(input.cleanverseApiKey)},
      ${input.merchantWalletAddress}, ${encryptSecret(input.merchantWalletPrivateKey)},
      ${input.policy.solvencyRule}, ${input.policy.anomalyTolerance}, ${input.policy.escalateTo}, ${startBlock.toString()}
    )
    returning *
  `;
  const merchant = rows[0];
  await sql`insert into baselines (merchant_id) values (${merchant.id})`;
  return merchant;
}

export async function listMerchantsForUser(ownerUserId: string): Promise<MerchantRow[]> {
  return sql<MerchantRow[]>`
    select * from merchants where owner_user_id = ${ownerUserId} order by created_at asc
  `;
}

/** Internal scheduler surface only. Never expose these rows through a user-facing route. */
export async function listAllMerchants(): Promise<MerchantRow[]> {
  return sql<MerchantRow[]>`select * from merchants order by created_at asc`;
}

export async function updateMerchantPolicy(merchantId: string, policy: MerchantPolicy): Promise<void> {
  await sql`
    update merchants set
      policy_solvency_rule = ${policy.solvencyRule},
      policy_anomaly_tolerance = ${policy.anomalyTolerance},
      policy_escalate_to = ${policy.escalateTo}
    where id = ${merchantId}
  `;
}

export async function updateLastSyncedBlock(merchantId: string, blockNumber: bigint): Promise<void> {
  await sql`update merchants set last_synced_block = ${blockNumber.toString()} where id = ${merchantId}`;
}

export interface DecryptedMerchantCreds {
  apiId: string;
  apiKey: string;
  baseUrl: string;
  walletPrivateKey: string;
}

export function decryptMerchantCreds(merchant: MerchantRow): DecryptedMerchantCreds {
  return {
    apiId: decryptSecret(merchant.cleanverse_api_id_enc),
    apiKey: decryptSecret(merchant.cleanverse_api_key_enc),
    baseUrl: merchant.cleanverse_api_base_url,
    walletPrivateKey: decryptSecret(merchant.merchant_wallet_private_key_enc),
  };
}

export function merchantPolicy(merchant: MerchantRow): MerchantPolicy {
  return {
    solvencyRule: merchant.policy_solvency_rule,
    anomalyTolerance: merchant.policy_anomaly_tolerance,
    escalateTo: merchant.policy_escalate_to,
  };
}
