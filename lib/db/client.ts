import "server-only";
import postgres from "postgres";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var ${name}`);
  return v;
}

type PgClient = ReturnType<typeof postgres>;

declare global {
  var __assaySql: PgClient | undefined;
}

/**
 * Lazily constructs the connection pool on first query rather than at module import. `next build`
 * imports every route module to collect page data -- an eager `postgres(env("DATABASE_URL"))` at
 * the top of this file would make the whole app fail to build in any environment (including a fresh
 * clone) where DATABASE_URL isn't set yet, even for routes that never touch the database.
 */
function getClient(): PgClient {
  if (!globalThis.__assaySql) {
    globalThis.__assaySql = postgres(env("DATABASE_URL"), { max: 5 });
  }
  return globalThis.__assaySql;
}

/** Tagged-template call (`sql\`...\``) and property access (`sql.json`, `sql.end`, ...) both proxy through. */
export const sql: PgClient = new Proxy((() => {}) as unknown as PgClient, {
  apply(_target, _thisArg, args) {
    const client = getClient() as unknown as (...a: unknown[]) => unknown;
    return client(...args);
  },
  get(_target, prop) {
    const client = getClient() as unknown as Record<string | symbol, unknown>;
    const value = client[prop as keyof typeof client];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
