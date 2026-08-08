import type { Address, Hex } from "viem";
import { publicClient, walletClientFromKey } from "./monad";

const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

export async function erc20BalanceOf(token: Address, account: Address): Promise<bigint> {
  return publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "balanceOf", args: [account] });
}

export async function erc20Decimals(token: Address): Promise<number> {
  return publicClient.readContract({ address: token, abi: ERC20_ABI, functionName: "decimals", args: [] });
}

/**
 * Plain on-chain ERC20-style transfer. For an A-Token, Cleanverse's compliance rule is enforced
 * INSIDE the contract's transfer function -- a non-compliant transfer reverts here, on-chain. There
 * is no separate Cleanverse "settle" API call; this IS the settlement.
 */
export async function erc20Transfer(
  token: Address,
  to: Address,
  amount: bigint,
  senderPrivateKey: Hex,
): Promise<Hex> {
  const wallet = walletClientFromKey(senderPrivateKey);
  const hash = await wallet.writeContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
