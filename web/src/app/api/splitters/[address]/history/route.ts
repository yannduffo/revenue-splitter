import { getAddress, type Address } from 'viem'
import { db, invalidAddress, parseAddress } from '@/lib/db'

type Row = {
  kind: 'created' | 'deposit' | 'claim'
  tx_hash: `0x${string}`
  log_index: number
  block_number: string
  ts: string
  actor: Address
  token: Address | null
  amount: string | null
  member_count: number | null
}

// creation + deposits + claims of one splitter, newest first
// replaces getHistory (same shape as HistoryEntry, bigints as strings)
export async function GET(_req: Request, ctx: RouteContext<'/api/splitters/[address]/history'>) {
  const splitter = parseAddress((await ctx.params).address)
  if (!splitter) return invalidAddress()

  // the three branches of a UNION ALL must have the same columns: NULL where
  // a kind has no value (no token for a creation, no member count for a deposit)
  const rows = await db()<Row[]>`
    SELECT 'created' AS kind, created_tx AS tx_hash, created_log_index AS log_index,
            created_block AS block_number, extract(epoch FROM created_at)::bigint AS ts,
            creator AS actor, NULL AS token, NULL AS amount,
            (SELECT count(*) FROM splitter_members WHERE splitter = s.address)::int AS member_count
    FROM splitters s WHERE address = ${splitter}
    UNION ALL
    SELECT 'deposit', tx_hash, log_index, block_number, extract(epoch FROM block_time)::bigint,
            sender, token, amount::text, NULL
    FROM deposits WHERE splitter = ${splitter}
    UNION ALL
    SELECT 'claim', tx_hash, log_index, block_number, extract(epoch FROM block_time)::bigint,
            member, token, amount::text, NULL
    FROM claims WHERE splitter = ${splitter}
    ORDER BY block_number DESC, log_index DESC
  `

  return Response.json(
    rows.map((r) => ({
      id: `${r.tx_hash}-${r.log_index}`,
      kind: r.kind,
      blockNumber: r.block_number,
      logIndex: r.log_index,
      timestamp: r.ts,
      txHash: r.tx_hash,
      actor: getAddress(r.actor),
      token: r.token ? getAddress(r.token) : undefined,
      amount: r.amount ?? undefined,
      memberCount: r.member_count ?? undefined,
    })),
  )
}
