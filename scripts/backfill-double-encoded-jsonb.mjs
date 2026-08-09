/**
 * One-off repair for decisions rows written before the store.ts double-encoding fix: payment/verdict
 * are jsonb SCALAR STRINGS containing JSON text instead of jsonb objects. Unwrap them.
 */
import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);

const before = await sql`select id, jsonb_typeof(payment) as pt, jsonb_typeof(verdict) as vt from decisions`;
console.log("before:", JSON.stringify(before));

await sql`update decisions set payment = (payment #>> '{}')::jsonb where jsonb_typeof(payment) = 'string'`;
await sql`update decisions set verdict = (verdict #>> '{}')::jsonb where jsonb_typeof(verdict) = 'string'`;

const after = await sql`select id, jsonb_typeof(payment) as pt, jsonb_typeof(verdict) as vt, payment, verdict from decisions`;
console.log("after:", JSON.stringify(after, null, 2));

const stillBad = after.filter(r => r.pt !== "object" || r.vt !== "object");
if (stillBad.length) {
  console.error(`${stillBad.length} rows still not objects after backfill`);
  process.exitCode = 1;
} else {
  console.log(`OK: all ${after.length} rows are now real jsonb objects`);
}
await sql.end();
