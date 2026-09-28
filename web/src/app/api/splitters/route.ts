import { getAddress, type Address } from "viem";
import { db } from "@/lib/db";

type Row = {
  address: Address
  creator: Address
  created_block: string
  members: { address: Address; shareBps: number}[]
}

//get every splitter created by the factory, latest first, member sorted by deacreasing share
//replaces listSplitters (and getSplitterBlock)
export async function GET() {
  const rows = await db() <Row[]>`
    SELECT s.address, s.creator, s.created_block,
           json_agg(
             json_build_object('address', m.member, 'shareBps', m.share_bps)
             ORDER BY m.share_bps DESC
           ) AS members
    FROM splitters s
    JOIN splitter_members m ON m.splitter = s.address
    GROUP BY s.address
    ORDER BY s.created_block DESC, s.created_log_index DESC
  `

  return Response.json(
    rows.map((r) => ({
      address: getAddress(r.address),
      creator: getAddress(r.creator),
      createdAtBlock: r.created_block,
      members: r.members.map((m) => ({address: getAddress(m.address), shareBps: m.shareBps}))
    }))
  )
}
