import type { Address } from "viem";
import { getJson } from "./api";

//even after the indexer update, we don't change the HistoryEntry type so we don't need a front-end update
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

//hitory type but adapted to what the api retrun (no bigint)
type ApiHistoryEntry = Omit<HistoryEntry, 'blockNumber' | 'timestamp' | 'amount'> & {
  blockNumber: string;
  timestamp?: string;
  amount?: string;
};

//get the creation + all the claim & deposit for a designated splitter
export async function getHistory(splitter: Address): Promise<HistoryEntry[]> {
  const entries = await getJson<ApiHistoryEntry[]>(`/api/splitters/${splitter}/history`)

  //retruning an HistoryEntry from the ApiHistoryEntry (correcting the necessary 3 champs)
  return entries.map((e) => ({
    ...e,
    blockNumber : BigInt(e.blockNumber),
    timestamp: e.timestamp === undefined ? undefined : BigInt(e.timestamp),
    amount: e.amount === undefined ? undefined : BigInt(e.amount)
  }))
}
