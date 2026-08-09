import { createPublicClient, defineChain, http } from "viem";
const monadTestnet = defineChain({ id: 10143, name: "Monad Testnet", nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 }, rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } }, testnet: true });
const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
const block = await publicClient.getBlock();
console.log(JSON.stringify({ blockNumber: block.number.toString(), timestamp: block.timestamp.toString(), nowUnix: Math.floor(Date.now()/1000) }, null, 2));
