import type { Address, PublicClient } from "viem";
import { splitterFactoryAbi } from "../generated";
import { FACTORY_ADDRESS } from "./config";
import type { Splitter } from "./types";
import { getJson } from "./api";

//new ApiSplitter type which is the Splitter type with createdAtBlock as a string (to match API return)
type ApiSplitter = Omit<Splitter, 'createdAtBlock'> & { createdAtBlock: string }

//get every splitter created by the factory (latest first, members sorted by decreasing share order)
export async function listSplitters(): Promise<Splitter[]> {
  const splitters = await getJson<ApiSplitter[]>('/api/splitters')
  return splitters.map((s) => ({...s, createdAtBlock: BigInt(s.createdAtBlock)}))
}

//even with the indexer, we are still using direct RPC calls to call solidity funcs
export async function isOfficialSplitter(client: PublicClient, address: Address): Promise<boolean> {
  return client.readContract({
    address: FACTORY_ADDRESS,
    abi: splitterFactoryAbi,
    functionName: "isOfficialSplitter",
    args: [address]
  })
}
