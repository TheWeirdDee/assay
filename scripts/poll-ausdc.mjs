/**
 * Poll the merchant wallet's aUSDC balance until it's non-zero or a deadline passes.
 * Usage: node --env-file=.env.local scripts/poll-ausdc.mjs
 */
import { createPublicClient, defineChain, http, formatUnits } from "viem";

const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  testnet: true,
});
const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
];

const AUSDC = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";
const MERCHANT_WALLET = "0x502136A8eF821573D71760493dB65Fed7475A195";

const POLL_INTERVAL_MS = 30_000;
const DEADLINE_MS = Date.now() + 20 * 60_000; // 20 minutes

const decimals = await publicClient.readContract({ address: AUSDC, abi: ERC20_ABI, functionName: "decimals", args: [] });

while (Date.now() < DEADLINE_MS) {
  const balance = await publicClient.readContract({ address: AUSDC, abi: ERC20_ABI, functionName: "balanceOf", args: [MERCHANT_WALLET] });
  const stamp = new Date().toLocaleTimeString();
  if (balance > 0n) {
    console.log(`[${stamp}] CONVERTED: ${formatUnits(balance, decimals)} aUSDC now at ${MERCHANT_WALLET}`);
    process.exit(0);
  }
  console.log(`[${stamp}] still 0 aUSDC, checking again in 30s...`);
  await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
}

console.log(`STILL 0 aUSDC after 20 minutes of polling -- likely genuinely stuck, worth escalating to Cleanverse support.`);
process.exit(1);
