/**
 * Query the Circle-faucet deposit address assigned to a sandbox wallet.
 * Usage:
 * node --env-file=.env.local scripts/query-deposit-address.mjs 0x502136A8eF821573D71760493dB65Fed7475A195
 */

const walletAddress = process.argv[2];

if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
  console.error("Pass one valid EVM wallet address as the first argument.");
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

const { queryDepositAddress } = await import("../lib/cleanverse/client.ts");

try {
  const result = await queryDepositAddress("monad", walletAddress, creds);
  console.log(JSON.stringify(result, null, 2));

  if (result.code !== "0000") {
    process.exitCode = 1;
  } else if (result.data?.depositUSDCWallet) {
    console.log(`Circle faucet deposit address: ${result.data.depositUSDCWallet}`);
  } else {
    console.error("Cleanverse returned no USDC deposit address for this wallet.");
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
