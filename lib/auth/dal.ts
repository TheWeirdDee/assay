/** Data Access Layer: every page/action that touches user or merchant data verifies through here. */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { sql } from "../db/client";
import { currentUserId } from "./session";

export interface AuthedUser {
  id: string;
  email: string;
}

/** Redirects to /login if there's no valid session. Memoized per request. */
export const requireUser = cache(async (): Promise<AuthedUser> => {
  const userId = await currentUserId();
  if (!userId) redirect("/login");

  const rows = await sql<AuthedUser[]>`select id, email from users where id = ${userId}`;
  const user = rows[0];
  if (!user) redirect("/login");
  return user;
});

/** Like requireUser but returns null instead of redirecting -- for optional-auth surfaces (e.g. landing page). */
export const getUser = cache(async (): Promise<AuthedUser | null> => {
  const userId = await currentUserId();
  if (!userId) return null;
  const rows = await sql<AuthedUser[]>`select id, email from users where id = ${userId}`;
  return rows[0] ?? null;
});

export interface MerchantRow {
  id: string;
  owner_user_id: string;
  name: string;
  chain: string;
  atoken_address: string;
  cleanverse_api_base_url: string;
  cleanverse_api_id_enc: string;
  cleanverse_api_key_enc: string;
  merchant_wallet_address: string;
  merchant_wallet_private_key_enc: string;
  policy_solvency_rule: boolean;
  policy_anomaly_tolerance: "low" | "medium" | "high";
  policy_escalate_to: string;
  last_synced_block: string;
  created_at: Date;
}

/** Verifies the session AND that this user owns the merchant -- prevents cross-tenant access by id-guessing. */
export async function requireMerchant(merchantId: string): Promise<{ user: AuthedUser; merchant: MerchantRow }> {
  const user = await requireUser();
  const rows = await sql<MerchantRow[]>`
    select * from merchants where id = ${merchantId} and owner_user_id = ${user.id}
  `;
  const merchant = rows[0];
  if (!merchant) redirect("/app");
  return { user, merchant };
}
