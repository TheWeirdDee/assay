import { createPublicClient, createWalletClient, defineChain, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

/** Monad testnet -- chain id and RPC confirmed live via eth_chainId (0x279f = 10143). */
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  testnet: true,
});

export const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });

export function walletClientFromKey(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({ account, chain: monadTestnet, transport: http() });
}
