import postgres from "postgres";
const sql = postgres(process.env.DATABASE_URL);
const obj = { from: "0xTEST", amount: 42, direction: "in", fundsRef: "test" };
const [row] = await sql`select ${obj}::jsonb as payment, jsonb_typeof(${obj}::jsonb) as t`;
console.log(JSON.stringify(row, null, 2));
console.log("typeof row.payment:", typeof row.payment, "row.payment.from:", row.payment?.from);
await sql.end();
