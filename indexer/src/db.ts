//all write and read from and to the postgres db
import postgres from "postgres";
import type { Address, Hex } from "viem";
import { DATABASE_URL } from "./config.ts";

//helper make postgres bigint and js bigint "equal"
export const sql = postgres(DATABASE_URL, {
  types: { bigint: postgres.BigInt }
});

//the cursor is the last indexed block
// if db not initialized : row will be undefined so the cursor will
export async function getCursor(): Promise<bigint | undefined> {
  const [row] = await sql<{ max: bigint | null }[]>`
    SELECT MAX(block_number) AS max FROM checkpoints`;
  return row?.max ?? undefined;
}

export async function getSplitterAddresses(): Promise<Address[]> {
  const rows = await sql<{ address: Address }[]>`SELECT address FROM splitters`;
  return rows.map((r) => r.address);
}

export async function getCheckpoints() {
  return sql<{ block_number: bigint; block_hash: Hex }[]>`SELECT block_number, block_hash FROM checkpoints ORDER BY block_number DESC`;
}

//delete everything after "block" (so the worker will resume at block + 1)
export async function rollbackTo(block: bigint) {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM deposits WHERE block_number > ${block}`;
    await tx`DELETE FROM claims WHERE block_number > ${block}`;
    await tx`DELETE FROM splitters WHERE created_block > ${block}`;
    await tx`DELETE FROM checkpoints WHERE block_number > ${block}`;
  })
}

// the max delete is finalized
export async function pruneCheckpoints(finalized: bigint) {
  await sql`DELETE FROM checkpoints WHERE block_number < (SELECT MAX(block_number) FROM checkpoints WHERE block_number <= ${finalized})`;
}
