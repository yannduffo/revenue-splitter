//the loop
import { CONFIRMATIONS, FACTORY_BLOCK, POLL_MS, WINDOW } from "./config.ts";
import { getCursor, pruneCheckpoints, sql } from "./db.ts";
import { handleReorg } from "./reorg.ts";
import { getFinalizedBlockNumber, getHead } from "./rpc.ts";
import { syncRange } from "./sync.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

let running = true;

// ctrl-c: finish the current tick, then close the Postgres pool
process.on("SIGINT", () => {
  console.log("stopping after the current tick…");
  running = false;
});

// a failed tick is simply retried at the next one: ranges are atomic
while (running) {
  try {
    await tick();
  } catch (error) {
    console.error("tick failed:", error);
  }
  if (running) await sleep(POLL_MS);
}

await sql.end();
