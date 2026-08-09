/**
 * Cleanverse-indexed tx history for a wallet -- used here to check whether the deposit/conversion
 * has been picked up by Cleanverse's indexer at all.
 * Usage: node --env-file=.env.local scripts/query-txs.mjs <address>
 */
const address = process.argv[2];
if (!address) {
  console.error("Pass one wallet address as the first argument.");
  process.exit(1);
}

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const creds = {
  apiId: requiredEnv("CLEANVERSE_API_ID"),
  apiKey: requiredEnv("CLEANVERSE_API_KEY"),
  baseUrl:
    process.env.CLEANVERSE_API_BASE_URL ||
    "https://uatapi.cleanverse.com/api/cooperate",
};

const { queryTransactions } = await import("../lib/cleanverse/client.ts");

try {
  const result = await queryTransactions({ chain: "monad", address, pageSize: 20 }, creds);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
