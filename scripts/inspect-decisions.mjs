import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);
const rows = await sql`
  select id, ts, payment, verdict, outcome, amount_units, tx_hash, compliance_code, resolution, source_tx_hash
  from decisions where merchant_id = ${process.argv[2]} order by ts asc
`;
console.log(`count: ${rows.length}`);
console.log(JSON.stringify(rows, null, 2));
await sql.end();
