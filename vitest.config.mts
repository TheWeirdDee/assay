import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Hosted free-tier Postgres can take several seconds to wake before the first query.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    // `server-only` intentionally throws outside Next's server compiler. Vitest runs these modules
    // in Node, so replace the guard with an empty module while exercising the real server code.
    alias: { "server-only": new URL("./test/server-only.ts", import.meta.url).pathname },
  },
});
