//all write and read from and to the postgres db
import postgres from "postgres";
import type { Address } from "viem";
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
