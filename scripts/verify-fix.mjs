import postgres from "postgres";
import { createHash, randomBytes } from "node:crypto";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const merchantId = "c4526355-ae65-4105-8774-85381cc8bb13";
const [owner] = await sql`select owner_user_id from merchants where id = ${merchantId}`;
const token = randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");

await sql`insert into sessions (user_id, token_hash, expires_at) values (${owner.owner_user_id}, ${tokenHash}, now() + interval '10 minutes')`;

try {
  for (const view of ["overview", "payments", "inbox", "operations", "compliance"]) {
    const response = await fetch(`https://assay-web-orcin.vercel.app/app/${merchantId}?view=${view}`, {
      headers: { cookie: `assay_session=${token}` },
      redirect: "manual",
    });
    const body = await response.text();
    console.log(`${view}: HTTP ${response.status}, ${body.length} bytes, has "Cannot read": ${body.includes("Cannot read properties")}`);
  }
} finally {
  await sql`delete from sessions where token_hash = ${tokenHash}`;
  await sql.end();
}
