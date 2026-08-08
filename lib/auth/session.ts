/**
 * Database-backed sessions (Next's recommended pattern for auth without a library): the cookie holds
 * only an opaque random token; the DB holds the hash of that token plus expiry. Losing/leaking the
 * cookie doesn't reveal anything the DB row didn't already say, and sessions are individually
 * revocable (delete the row) unlike a stateless JWT.
 */
import "server-only";
import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "../db/client";

const COOKIE_NAME = "assay_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await sql`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${hashToken(token)}, ${expiresAt})
  `;

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function currentUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const rows = await sql<{ user_id: string }[]>`
    select user_id from sessions where token_hash = ${hashToken(token)} and expires_at > now()
  `;
  return rows[0]?.user_id ?? null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await sql`delete from sessions where token_hash = ${hashToken(token)}`;
  }
  store.delete(COOKIE_NAME);
}
