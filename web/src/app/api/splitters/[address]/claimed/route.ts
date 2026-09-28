import { getAddress, type Address } from 'viem'
  import { db, invalidAddress, parseAddress } from '@/lib/db'

  // total claimed per (token, member) pair. One small table serves both the per-token
  // view (getTokenBalances) and the per-member view (getMemberDetail): the client filters.
  export async function GET(_req: Request, ctx: RouteContext<'/api/splitters/[address]/claimed'>) {
  const splitter = parseAddress((await ctx.params).address)
  if (!splitter) return invalidAddress()

  const rows = await db()<{ token: Address; member: Address; amount: string }[]>`
    SELECT token, member, SUM(amount)::text AS amount
    FROM claims
    WHERE splitter = ${splitter}
    GROUP BY token, member
  `

  return Response.json(
    rows.map((r) => ({ token: getAddress(r.token), member: getAddress(r.member), amount: r.amount })),
  )
}
