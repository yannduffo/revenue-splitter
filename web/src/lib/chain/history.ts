import {
  getAbiItem,
  parseAbiItem,
  type Address,
  type PublicClient,
} from "viem";
import { splitterAbi, splitterFactoryAbi } from "../generated";
import { FACTORY_ADDRESS, FACTORY_BLOCK } from "./config";
import { collectLogs } from "./logs";

const transferEvent = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
);
const claimedEvent = getAbiItem({ abi: splitterAbi, name: "Claimed" });
const createdEvent = getAbiItem({
  abi: splitterFactoryAbi,
  name: "SplitterCreated",
});

export type HistoryEntry = {
  id: string;
  kind: "created" | "deposit" | "claim";
  blockNumber: bigint;
  logIndex: number;
  timestamp?: bigint;
  txHash: `0x${string}`;
  actor?: Address;
  token?: Address;
  amount?: bigint;
  memberCount?: number;
};

export async function getHistory(
  client: PublicClient,
  splitter: Address,
  fromBlock: bigint,
): Promise<HistoryEntry[]> {
  //getting the logs from RPC
  const [createdLogs, depositLogs, claimLogs] = await Promise.all([
    collectLogs(client, FACTORY_BLOCK, (from, to) =>
      client.getLogs({
        address: FACTORY_ADDRESS,
        event: createdEvent,
        args: { splitter },
        fromBlock: from,
        toBlock: to,
      }),
    ),
    collectLogs(client, fromBlock, (from, to) =>
      client.getLogs({
        event: transferEvent,
        args: { to: splitter },
        fromBlock: from,
        toBlock: to,
      }),
    ),
    collectLogs(client, fromBlock, (from, to) =>
      client.getLogs({
        address: splitter,
        event: claimedEvent,
        fromBlock: from,
        toBlock: to,
      }),
    )
  ])

  //creating History table
  const entries: HistoryEntry[] = []

  //filling history table
  for (const log of createdLogs) {
      entries.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        kind: 'created',
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        timestamp: (log as { blockTimestamp?: bigint }).blockTimestamp,
        txHash: log.transactionHash,
        actor: log.args.creator,
        memberCount: log.args.members?.length,
      })
    }

    for (const log of depositLogs) {
      if (log.topics.length !== 3) continue // écarte les ERC-721
      entries.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        kind: 'deposit',
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        timestamp: (log as { blockTimestamp?: bigint }).blockTimestamp,
        txHash: log.transactionHash,
        actor: log.args.from,
        token: log.address,
        amount: log.args.value,
      })
    }

    for (const log of claimLogs) {
      entries.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        kind: 'claim',
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        timestamp: (log as { blockTimestamp?: bigint }).blockTimestamp,
        txHash: log.transactionHash,
        actor: log.args.member,
        token: log.args.token,
        amount: log.args.amount,
      })
    }

    return entries.sort((a, b) => {
      if (a.blockNumber !== b.blockNumber) return a.blockNumber > b.blockNumber ? -1 : 1
      return b.logIndex - a.logIndex
    })
}
