import { parseAbiItem, type Address, type Hex } from "viem";
import { publicClient } from "./monad";

const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");

export interface DiscoveredTransfer {
  from: Address;
  amountUnits: bigint;
  txHash: Hex;
  blockNumber: bigint;
}

/**
 * Real inbound-payment detection: reads ERC20 Transfer events to the merchant's wallet since the
 * last synced block. This replaces "click a button to pretend a payment arrived" with the agent
 * actually watching the chain.
 */
export async function findInboundTransfers(
  tokenAddress: Address,
  toAddress: Address,
  fromBlock: bigint,
): Promise<DiscoveredTransfer[]> {
  const latest = await publicClient.getBlockNumber();
  if (fromBlock > latest) return [];

  const logs = await publicClient.getLogs({
    address: tokenAddress,
    event: TRANSFER_EVENT,
    args: { to: toAddress },
    fromBlock,
    toBlock: latest,
  });

  return logs
    .filter((log) => log.args.from !== undefined && log.args.value !== undefined)
    .map((log) => ({
      from: log.args.from as Address,
      amountUnits: log.args.value as bigint,
      txHash: log.transactionHash as Hex,
      blockNumber: log.blockNumber as bigint,
    }));
}
