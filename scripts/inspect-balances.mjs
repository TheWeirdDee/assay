/**
 * Ground-truth on-chain balance check, independent of the app -- where did the deposited USDC
 * actually land, and does the wallet actually hold aUSDC. Uses viem directly (not lib/chain/erc20.ts)
 * because Node's native TS loader needs explicit .ts extensions on relative specifiers, which that
 * file doesn't use (fine for the Next.js/webpack build, not for a standalone script).
 * Usage: node --env-file=.env.local scripts/inspect-balances.mjs
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

const USDC = "0x534b2f3A21130d7a60830c2Df862319e593943A3";
const AUSDC = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";
const MERCHANT_WALLET = "0x502136A8eF821573D71760493dB65Fed7475A195";
const DEPOSIT_WALLET = "0xBe21CE0cF93F6E8DDFD9D2742Ff59c95283E4a14";

async function report(label, token, holder) {
  const [balance, decimals] = await Promise.all([
    publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [holder] }),
    publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "decimals", args: [] }),
  ]);
  console.log(`${label}: ${formatUnits(balance, decimals)} (raw ${balance.toString()}, token ${token}, holder ${holder})`);
}

await report("USDC  @ merchant wallet", USDC, MERCHANT_WALLET);
await report("USDC  @ deposit wallet ", USDC, DEPOSIT_WALLET);
await report("aUSDC @ merchant wallet", AUSDC, MERCHANT_WALLET);
await report("aUSDC @ deposit wallet ", AUSDC, DEPOSIT_WALLET);
