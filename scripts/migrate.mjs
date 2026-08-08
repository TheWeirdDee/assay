// Applies lib/db/schema.sql against DATABASE_URL. Idempotent (every statement is IF NOT EXISTS).
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set. Add it to .env.local, then re-run: npm run db:migrate");
  process.exit(1);
}

const sql = postgres(databaseUrl, { max: 1 });

try {
  const schema = await readFile(new URL("../lib/db/schema.sql", import.meta.url), "utf8");
  await sql.unsafe(schema);
  console.log("Migration applied: users, sessions, merchants, baselines, decisions.");
} catch (err) {
  console.error("Migration failed:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}
