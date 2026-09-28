import { getAddress, type Address } from 'viem'
import { db, invalidAddress, parseAddress } from '@/lib/db'

// every token ever sent to the splitter, in order of first deposit
// replaces discoverTokens
export async function GET(_req: Request, ctx: RouteContext<'/api/splitters/[address]/tokens'>) {
  const splitter = parseAddress((await ctx.params).address)
  if (!splitter) return invalidAddress()

  const rows = await db()<{ token: Address }[]>`
    SELECT token FROM deposits
    WHERE splitter = ${splitter}
    GROUP BY token
    ORDER BY MIN(block_number)
  `

  return Response.json(rows.map((r) => getAddress(r.token)))
}
