import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const rows = await sql`
  select d.id, d.ts, d.merchant_id, m.name as merchant_name, d.outcome, d.tx_hash, d.resolved_tx_hash, d.payment
  from decisions d join merchants m on m.id = d.merchant_id
  where d.tx_hash is not null or d.resolved_tx_hash is not null
  order by d.ts asc
`;
console.log(JSON.stringify(rows, null, 2));
await sql.end();
