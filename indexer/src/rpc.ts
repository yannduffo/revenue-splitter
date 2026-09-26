//everypting that interrogate the chain
import { createPublicClient, http, type Address } from "viem";
import { sepolia } from "viem/chains";
import { claimedEvent, transferEvent, splitterCreatedEvent } from "./abis.ts";
import { BATCH_SIZE, BLOCK_PAUSE_MS, FACTORY_ADDRESS, LOGS_PAUSE_MS, RPC_URL } from "./config.ts";

const client = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL, { retryCount: 5, retryDelay: 1_000 })
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

//every RPC call goes through here (the pacer) = sequetial + pauses keeps it under Infura free tier budget
async function paced<T>(pauseMs: number, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } finally {
    await sleep(pauseMs);
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

export function getHead() {
  return paced(BLOCK_PAUSE_MS, () => client.getBlockNumber({ cacheTime: 0 }));
}

export function getBlock(blockNumber: bigint) {
  return paced(BLOCK_PAUSE_MS, () => client.getBlock({ blockNumber }));
}

//retreive splitters and splitters info
export function getCreatedLogs(fromBlock: bigint, toBlock: bigint) {
  return paced(LOGS_PAUSE_MS, () =>
    client.getLogs({
      address: FACTORY_ADDRESS,
      event: splitterCreatedEvent,
      fromBlock,
      toBlock,
      strict: true        //strict:true require strict event match : an ERC721 with 4 topics won't pass
    })
  );
}

//retreive deposits
export async function getDeposits(splitters: Address[], fromBlock: bigint, toBlock: bigint) {
  const batches = chunk(splitters, BATCH_SIZE);
  const results = [];

  //if their are no splitters : batch is empty so we don't even make the request
  for (const batch of batches) {
    results.push(
      await paced(LOGS_PAUSE_MS, () =>
        client.getLogs({
          event: transferEvent,
          args: { to: batch },
          fromBlock,
          toBlock,
          strict: true
        })
      )
    );
  }

  return results.flat();
}

//retreive claims
export async function getClaims(splitters: Address[], fromBlock: bigint, toBlock: bigint) {
  const batches = chunk(splitters, BATCH_SIZE);
  const results = [];

  for (const batch of batches) {
    results.push(
      await paced(LOGS_PAUSE_MS, () =>
        client.getLogs({
          address: batch,
          event: claimedEvent,
          fromBlock,
          toBlock,
          strict: true
        })
      )
    );
  }

  return results.flat();
}
