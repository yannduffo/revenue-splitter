//the heart : it indexes a block batch
import type { Address, Hex } from "viem";
import { getSplitterAddresses, sql } from "./db.ts";
import { getBlock, getClaims, getCreatedLogs, getDeposits } from "./rpc.ts";

// everythiing is stored lowercase (schema convention)
const lower = <T extends string>(value: T) => value.toLowerCase() as T;

/**
* Indexes one block range [fromBlock, toBlock] and moves the cursor to toBlock.
* All-or-nothing: every row and the checkpoint go in a single transaction, so a
* crash mid-range leaves the database exactly as it was.
*/
export async function syncRange(fromBlock: bigint, toBlock: bigint) {
  // hash of toBlock BEFORE reading the logs, compared again after (see step 3)
  const toHashBefore = (await getBlock(toBlock)).hash;

  // --- 1. check if splitters were created in this range ----
  const created = await getCreatedLogs(fromBlock, toBlock); //splitter from this block range
  const known = await getSplitterAddresses(); //old splitters already known
  //concatenate new and old list so everything is queried once
  const splitters: Address[] = [...known, ...created.map((l) => lower(l.args.splitter))];

  // --- 2. same range, same list ---
  const deposits = await getDeposits(splitters, fromBlock, toBlock);
  const claims = await getClaims(splitters, fromBlock, toBlock);

  // --- 3. block timestamps (Infura doesn't return blockTimestamp in getLogs) ---
  const allLogs = [...created, ...deposits, ...claims];
  const blockNumbers = new Set<bigint>([toBlock]);
  for (const l of allLogs) blockNumbers.add(l.blockNumber);

  const blocks = new Map<bigint, { hash: Hex; time: Date }>();
  for (const n of blockNumbers) {
    const block = await getBlock(n);
    blocks.set(n, { hash: block.hash, time: new Date(Number(block.timestamp) * 1000) });
  }
  const timeOf = (n: bigint) => blocks.get(n)!.time;

  // the chain must not have moved while we were reading it:
  //  - toBlock still has the hash it had before the getLogs
  //  - every log belongs to the block we just fetched (same hash)
  // otherwise we throw before writing anything: the tick fails and the range is replayed
  if (blocks.get(toBlock)!.hash !== toHashBefore) {
    throw new Error(`reorg while syncing [${fromBlock}, ${toBlock}]: #${toBlock} changed`);
  }
  for (const l of allLogs) {
    if (l.blockHash !== blocks.get(l.blockNumber)!.hash) {
      throw new Error(`reorg while syncing [${fromBlock}, ${toBlock}]: log from a stale #${l.blockNumber}`);
    }
  }

  // --- 4. creating the db rows from the log values (keys = column names) ---
  const splitterRows = created.map((l) => ({
    address: lower(l.args.splitter),
    creator: lower(l.args.creator),
    created_block: l.blockNumber,
    created_log_index: l.logIndex,
    created_tx: lower(l.transactionHash),
    created_at: timeOf(l.blockNumber),
  }));

  const memberRows = created.flatMap((l) =>
    l.args.members.map((member, i) => ({
      splitter: lower(l.args.splitter),
      member: lower(member),
      share_bps: Number(l.args.shareDistribution[i]!), // same length, enforced by Splitter.initialize
    })),
  );

  // uint256 → string: a bigint parameter would be sent as a Postgres BIGINT and
  // overflow past 2^63. As a string, Postgres casts it to the NUMERIC(78,0) column
  const depositRows = deposits.map((l) => ({
    tx_hash: lower(l.transactionHash),
    log_index: l.logIndex,
    block_number: l.blockNumber,
    block_time: timeOf(l.blockNumber),
    splitter: lower(l.args.to),
    token: lower(l.address),
    sender: lower(l.args.from),
    amount: l.args.value.toString(),
  }));

  const claimRows = claims.map((l) => ({
    tx_hash: lower(l.transactionHash),
    log_index: l.logIndex,
    block_number: l.blockNumber,
    block_time: timeOf(l.blockNumber),
    splitter: lower(l.address),
    token: lower(l.args.token),
    member: lower(l.args.member),
    amount: l.args.amount.toString(),
  }));

  // --- 5. one transaction. Splitters first: the other tables reference them ---
  // sql(rows) with an empty array is invalid SQL, hence the guards.
  await sql.begin(async (tx) => {
    if (splitterRows.length) await tx`INSERT INTO splitters ${sql(splitterRows)} ON CONFLICT DO NOTHING`;
    if (memberRows.length) await tx`INSERT INTO splitter_members ${sql(memberRows)} ON CONFLICT DO NOTHING`;
    if (depositRows.length) await tx`INSERT INTO deposits ${sql(depositRows)} ON CONFLICT DO NOTHING`;
    if (claimRows.length) await tx`INSERT INTO claims ${sql(claimRows)} ON CONFLICT DO NOTHING`;

    await tx`
      INSERT INTO checkpoints (block_number, block_hash)
      VALUES (${toBlock}, ${blocks.get(toBlock)!.hash})
    `;
  });

  return { splitters: splitterRows.length, deposits: depositRows.length, claims:claimRows.length };
}
