import type { PublicClient } from "viem";

// infura limits 10_000 block logs -> solution : loop the getLogs call on 10_000 blocks windows
const MAX_RANGE = 10_000n;

// helper (template shape) to loop on the logs call (but the call is still configured in deisgnated libs/)
export async function collectLogs<T>(
  client: PublicClient,
  fromBlock: bigint,
  fetchRange: (fromBlock: bigint, toBlock: bigint) => Promise<T[]>,
): Promise<T[]> {
  const latest = await client.getBlockNumber();
  const logs: T[] = [];

  // sequetialy call with batches of 10_000 blocks
  for (let from = fromBlock; from <= latest; from += MAX_RANGE) {
    const to = from + MAX_RANGE - 1n;
    logs.push(...(await fetchRange(from, to > latest ? latest : to)));
  }

  return logs;
}
