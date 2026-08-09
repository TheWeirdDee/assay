import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);
const rows = await sql`
  select merchant_id, id, jsonb_typeof(payment) as payment_type, jsonb_typeof(verdict) as verdict_type
  from decisions
`;
console.log(JSON.stringify(rows, null, 2));
const bad = rows.filter(r => r.payment_type === "string" || r.verdict_type === "string");
console.log(`\n${bad.length} of ${rows.length} rows are double-encoded`);
await sql.end();
