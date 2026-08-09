/**
 * Discover the real, currently-registered A-Token contract(s) for a chain (e.g. Monad's aUSDC).
 * Usage: node --env-file=.env.local scripts/query-atoken-list.mjs
 */

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

const { queryDepositAtokenList } = await import("../lib/cleanverse/client.ts");

try {
  const result = await queryDepositAtokenList("monad", creds);
  console.log(JSON.stringify(result, null, 2));
  if (result.code !== "0000") process.exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
