import 'server-only'
import postgres from 'postgres'
import { isAddress } from 'viem'

// read-only access to indexer database
// postgres.js returns BIGINT and NUMERIC as strings : exactly what JSON needs

//one pool per server process
const globalForDb = globalThis as unknown as { indexerDb?: postgres.Sql };

// created at 1st use (not import)
// DATABASE_URL is a runtime variable that doesn't exist at build time
export function db(): postgres.Sql {
  if (!globalForDb.indexerDb) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL is not set")
    globalForDb.indexerDb = postgres(url, {max: 5})
  }
  return globalForDb.indexerDb;
}

//route param -> lowercase address or null if invalid
export function parseAddress(raw: string): string | null {
  return isAddress(raw) ? raw.toLowerCase() : null;
}

export const invalidAddress = () => Response.json({error: 'invalid address'}, { status: 400})
