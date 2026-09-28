import type {Address, PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { Member, MemberBalance, SplitterToken } from "./types";
import { getJson } from "./api";

export type MemberTokenRow = {
  token: Address,
  symbol: string,
  decimals: number,
  attributed: bigint,
  pending: bigint,
  claimed:bigint
}

//total claimed per (token, member) pair, one row per pair (indexer)
type ClaimedRow = { token: Address, member: Address, amount: string }

//get all claim for a designated splitter from the indexer
function getClaimed(splitter: Address): Promise<ClaimedRow[]>{
  return getJson<ClaimedRow[]>(`/api/splitters/${splitter}/claimed`)
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

// Get all member related balances (pending, claimed) to the designated token
export async function getTokenBalances(
  client: PublicClient,
  splitter: Address,
  token: Address,
  members: Member[],
): Promise<MemberBalance[]> {
  const [pendings, claimed] = await Promise.all([
    Promise.all(
      members.map((m) =>
        client.readContract({
          address: splitter,
          abi: splitterAbi,
          functionName: 'pending',
          args: [token, m.address],
        })
      )
    ),
    getClaimed(splitter),
  ])

  //the API already sums per (token, member): keep this token's rows, key them by member
  const claimedBy = new Map(
    claimed
      .filter((c) => same(c.token, token))
      .map((c) => [c.member.toLowerCase(), BigInt(c.amount)])
  )

  //returning the final MemberBalance table
  return members.map((m, i) => ({
    member: m.address,
    pending: pendings[i],
    claimed: claimedBy.get(m.address.toLowerCase()) ?? 0n,
  }))
}

// pending: live view calls. claimed: indexer
export async function getMemberDetail(
  client: PublicClient,
  splitter: Address,
  member: Address,
  tokens: SplitterToken[],
): Promise<MemberTokenRow[]> {
  const [pendings, claimed] = await Promise.all([
    Promise.all(
      tokens.map((t) =>
        client.readContract({
          address: splitter,
          abi: splitterAbi,
          functionName: 'pending',
          args: [t.address, member],
        }),
      ),
    ),
    getClaimed(splitter),
  ])

  // same table, filtered the other way: this member's rows, keyed by token
  const claimedByToken = new Map(
    claimed
      .filter((c) => same(c.member, member))
      .map((c) => [c.token.toLowerCase(), BigInt(c.amount)]),
  )

  return tokens.map((t, i) => ({
    token: t.address,
    symbol: t.symbol,
    decimals: t.decimals,
    attributed: t.attributed,
    pending: pendings[i],
    claimed: claimedByToken.get(t.address.toLowerCase()) ?? 0n,
  }))
}
