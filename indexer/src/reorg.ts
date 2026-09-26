import { FACTORY_BLOCK } from "./config.ts";
import { getCheckpoints, rollbackTo } from "./db.ts";
import { getBlock } from "./rpc.ts";

/**
* Makes sure everything in the database still belongs to the canonical chain.
*
* Each block contains the hash of its parent: if our newest checkpoint still has the
* same hash on-chain, every block before it is unchanged too → nothing to do (1 call).
*
* Otherwise we walk back through the checkpoints until one matches (the fork point is
* after it) and delete everything indexed after that checkpoint. After the worker simply
* start again from the fork
*/
export async function handleReorg() {
  const checkpoints = await getCheckpoints(); // newest first
  if (checkpoints.length === 0) return; // fresh database case

  for (const [i, checkpoint] of checkpoints.entries()) {
    const block = await getBlock(checkpoint.block_number);
    if (block.hash !== checkpoint.block_hash) continue;

    if (i > 0) {
      console.warn(`reorg detected: rolling back to #${checkpoint.block_number}`);
      await rollbackTo(checkpoint.block_number);
    }
    return;
  }

  // no checkpoint matches: can't happen if pruning keeps one at or below `finalized`,
  // but if it does, starting over is always correct (a full resync takes ~40s)
  console.warn("no checkpoint matches the chain: full resync");
  await rollbackTo(FACTORY_BLOCK - 1n);
}
