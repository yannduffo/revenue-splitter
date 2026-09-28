//the loop
import { CONFIRMATIONS, FACTORY_BLOCK, POLL_MS, WINDOW } from "./config.ts";
import { getCursor, pruneCheckpoints, sql } from "./db.ts";
import { handleReorg } from "./reorg.ts";
import { getFinalizedBlockNumber, getHead } from "./rpc.ts";
import { syncRange } from "./sync.ts";
import { setTimeout as sleep } from "node:timers/promises";

// catches up from the cursor to (head - CONFIRMATIONS), in windows of WINDOW blocks.
// The initial sync and the steady state are the same loop: only the gap size differs.
async function tick() {
  // first: is what we already indexed still on the canonical chain? (may move the cursor back)
  await handleReorg();

  const target = (await getHead()) - CONFIRMATIONS;
  let cursor = (await getCursor()) ?? FACTORY_BLOCK - 1n;

  while (cursor < target) {
    const from = cursor + 1n;
    const to = from + WINDOW - 1n < target ? from + WINDOW - 1n : target;

    const t0 = performance.now();
    const n = await syncRange(from, to);
    const ms = (performance.now() - t0).toFixed(0);
    console.log(`[${from} → ${to}] +${n.splitters} splitters +${n.deposits} deposits +${n.claims} claims(${ms} ms)`);

    cursor = to;
  }

  await pruneCheckpoints(await getFinalizedBlockNumber());
}

const stopping = new AbortController();

for (const signal of ["SIGINT", "SIGTERM"] as const) { //SIGTERM for docker
  process.on(signal, () => {
    console.log(`${signal}: stopping after the current tick...`);
    stopping.abort();
  });
}

//a failed tick is simply retried at the next one : reanges are atomic
while (!stopping.signal.aborted) {
  try {
    await tick();
  }
  catch(error) {
    console.error("tick failed", error);
  }
  //an aborted sleep rejects -> "wake up now" not error
  await sleep(POLL_MS, undefined, {signal: stopping.signal}).catch(() => {})
}

await sql.end();
console.log("stopped");
