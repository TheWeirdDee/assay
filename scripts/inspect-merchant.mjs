/**
 * Dump merchant rows relevant to readiness diagnosis (no secrets printed).
 * Connects directly with `postgres` rather than lib/db/client.ts, which pulls in `server-only`
 * and refuses to load outside a Next.js server render.
 * Usage: node --env-file=.env.local scripts/inspect-merchant.mjs
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);
const rows = await sql`
  select id, name, chain, atoken_address, merchant_wallet_address, created_at
  from merchants order by created_at asc
`;
console.log(JSON.stringify(rows, null, 2));
await sql.end();
