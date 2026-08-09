import { createPublicClient, defineChain, http } from "viem";
const monadTestnet = defineChain({ id: 10143, name: "Monad Testnet", nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 }, rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } }, testnet: true });
const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

const hashes = [
  "0x8c922c454d2d70bb024aac0243e06e26345c10424bc38f0c5597f5187053a583",
  "0x0880981a0348e110794b1aba7230ff5b10bd23c6bfbfaaa85d81c44944f9b9c8",
  "0xb0c00242780a0efe32b0890298f91d41297fe24b835b140cbcc095c4c10806df",
];

for (const hash of hashes) {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash });
    console.log(JSON.stringify({
      hash,
      status: receipt.status,
      blockNumber: receipt.blockNumber.toString(),
      from: receipt.from,
      to: receipt.to,
    }));
  } catch (err) {
    console.log(JSON.stringify({ hash, error: err instanceof Error ? err.message : String(err) }));
  }
}
