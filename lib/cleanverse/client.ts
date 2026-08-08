/**
 * Cleanverse rails client — the compliance layer Assay calls, never reimplements.
 *
 * Endpoint shapes are from the gated Cooperate API docs (v5.6), stored locally (gitignored, not
 * committed — proprietary) at .cleanverse-docs/api-reference.md. Real findings vs. the earlier
 * pre-docs assumptions:
 *  - There is no separate "CCP check" endpoint. verify_apass IS the pre-flight compliance check,
 *    scoped per A-Token: it tells you whether a transfer to `address` would be allowed before you
 *    attempt it on-chain. The actual gate is enforced by the A-Token contract at transfer time
 *    regardless -- a non-compliant transfer reverts on-chain. That's fail-closed at the chain level,
 *    not just an app-level branch.
 *  - There is no escrow hold/release/refund API. "Hold" in Assay's design means: the agent simply
 *    does not call the on-chain transfer until it decides ALLOW. No third-party escrow contract.
 *  - The audit report is POST /download_travel_rule (by txHash).
 *  - A-Token transfer itself is a normal on-chain call (viem `writeContract`), not a Cleanverse REST
 *    endpoint -- see lib/chain/ (Phase 2) once that's built.
 */
import { encryptCleanverseBody, decryptCleanverseBody } from "./crypto";

export interface CleanverseCreds {
  apiId: string;
  apiKey: string;
  baseUrl: string;
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

export function credsFromEnv(): CleanverseCreds {
  return {
    apiId: env("CLEANVERSE_API_ID"),
    apiKey: env("CLEANVERSE_API_KEY"),
    baseUrl: process.env.CLEANVERSE_API_BASE_URL || "https://uatapi.cleanverse.com/api/cooperate",
  };
}

export type Chain =
  | "solana"
  | "base"
  | "avalanche"
  | "arbitrum"
  | "ethereum"
  | "polygon"
  | "bsc"
  | "monad"
  | "hashkey"
  | "platon";

interface CleanverseEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

async function callPlain<T>(
  path: string,
  body: object,
  creds: CleanverseCreds,
  method: "GET" | "POST" = "POST",
): Promise<CleanverseEnvelope<T>> {
  const res = await fetch(`${creds.baseUrl}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "api-id": creds.apiId },
    body: method === "GET" ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cleanverse ${path} HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function callEncrypted<T>(
  path: string,
  plaintextBody: object,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<T>> {
  const encrypted = encryptCleanverseBody(plaintextBody, creds.apiKey);
  const res = await fetch(`${creds.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-id": creds.apiId },
    body: JSON.stringify(encrypted),
  });
  if (!res.ok) throw new Error(`Cleanverse ${path} HTTP ${res.status}: ${await res.text()}`);
  const envelope = (await res.json()) as CleanverseEnvelope<T>;
  return envelope;
}

// ---------------------------------------------------------------------------
// A-Pass Management
// ---------------------------------------------------------------------------

export interface WalletRef {
  address: string;
  chain: Chain;
}

export interface IdentityData {
  idType: "ID_CARD" | "PASSPORT" | "DRIVER_LICENSE" | "HK_MACAO_TAIWAN_PASS" | "RESIDENCE_PERMIT";
  fullName: string;
  idNumber?: string;
  validUntil?: string; // yyyy-MM-dd
  issuingCountryISO2: string;
}

export interface GenerateAPassRequest {
  customerId: string; // 12+ chars, A-Z/a-z/0-9 only
  kycSource?: string;
  kycId?: string;
  subTier?: number;
  subGroup?: string;
  override?: boolean;
  expirationTime: number; // unix seconds
  wallet: WalletRef;
  identityDataList?: IdentityData[];
}

export interface GenerateAPassResult {
  customerId: string;
  cvRecordId: string;
  tier: string;
  wallet: { operate: string; address: string; chain: string; txHash: string };
}

/** A-Pass (CVI) registration for a test wallet. Required before that wallet can hold/receive A-Token. */
export async function generateAPass(
  req: GenerateAPassRequest,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<GenerateAPassResult>> {
  return callEncrypted<GenerateAPassResult>("/generate_apass", req, creds);
}

export interface UpdateStatusRequest {
  customerId?: string;
  cvRecordId?: string;
  status: "1" | "2"; // 1 activate/unfreeze, 2 freeze
  blacklistReason?: string;
  wallet: WalletRef;
}

export async function updateAPassStatus(
  req: UpdateStatusRequest,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<{ txHash: string }>> {
  return callEncrypted("/update_status", req, creds);
}

// ---------------------------------------------------------------------------
// Common Queries
// ---------------------------------------------------------------------------

export interface QueryAPassResult {
  cvRecordId: string;
  subTier: number;
  tier: string;
  status: 1 | 2;
  expirationTime: number;
  subGroup: string;
  currentKycHash: string;
  group: string;
  countries: string[];
}

/** A wallet's A-Pass basic info (tier/expiry/countries). Not deposit addresses. */
export async function queryAPass(
  chain: Chain,
  address: string,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<QueryAPassResult>> {
  return callPlain("/query_apass", { chain, address }, creds);
}

export type VerifyAPassCode = 1 | 2 | 3 | 4; // 1 token not found, 2 no A-Pass, 3 blocked, 4 allowed

export interface VerifyAPassResult {
  chain: string;
  atoken: string;
  address: string;
  code: VerifyAPassCode;
  message: string;
  magickLink?: string;
}

/**
 * THE compliance pre-flight check (there is no separate "CCP check" endpoint -- this is it).
 * data.code === 4 means the transfer is allowed; the top-level envelope is 0000 ("call succeeded")
 * even when data.code is 1-3, so callers must check data.code, not just envelope.code.
 */
export async function verifyAPass(
  chain: Chain,
  atoken: string,
  address: string,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<VerifyAPassResult>> {
  return callPlain("/verify_apass", { chain, atoken, address }, creds);
}

export interface QueryTxsRequest {
  chain: Chain;
  address: string;
  symbol?: string;
  startTime?: number;
  endTime?: number;
  txHash?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface CleanverseTx {
  chain: string;
  symbol: string;
  tx_hash: string;
  from_address: string;
  from_org_name: string;
  to_address: string;
  amount: string;
  fee_amount: string;
  pay_fee_index: number;
  type: string;
  block_number: number;
  block_time: number;
  status: string;
}

/** Real on-chain tx history for a wallet -- used to seed the judgment engine's learned baseline. */
export async function queryTransactions(
  req: QueryTxsRequest,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<{ total_count: number; txs: CleanverseTx[] }>> {
  return callPlain("/query_txs", req, creds);
}

export interface DownloadTravelRuleRequest {
  customerId?: string;
  cvRecordId?: string;
  txHash: string; // withdraw txHash for Travel Rule reports; transfer txHash for Transaction reports
  wallet: WalletRef;
}

/** The disclosable compliance/audit report for a settled action -- the "CCP proof" half of the dual log. */
export async function downloadTravelRule(
  req: DownloadTravelRuleRequest,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<{ downloadUrl: string; fileName: string }>> {
  return callPlain("/download_travel_rule", req, creds);
}

export interface QueryDepositAtokenListResult {
  chain: string;
  tokens: Array<{
    origin_token: { address: string; name: string; symbol: string; decimals: number; icon: string };
    atoken: { address: string; name: string; symbol: string; decimals: number; icon: string };
    accesscore_address: string;
    apass_address: string;
  }>;
}

/** Discover the real A-Token contract address(es) for a chain (e.g. to find the Monad testnet A-Token). */
export async function queryDepositAtokenList(
  chain: Chain,
  creds: CleanverseCreds,
): Promise<CleanverseEnvelope<QueryDepositAtokenListResult>> {
  return callPlain("/query_deposit_atoken_list", { chain }, creds);
}

export { decryptCleanverseBody };
