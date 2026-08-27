import { getAbiItem, type Address, type PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { Member, MemberBalance, SplitterToken } from "./types";

const claimedEvent = getAbiItem({ abi: splitterAbi, name: "Claimed" });

export type MemberTokenRow = {
  token: Address,
  symbol: string,
  decimals: number,
  attributed: bigint,
  pending: bigint,
  claimed:bigint
}

// Get all member related balances (pending, claimed) to the designated token
export async function getTokenBalances(
  client: PublicClient,
  splitter: Address,
  token: Address,
  members: Member[],
): Promise<MemberBalance[]> {
  const [pendings, logs] = await Promise.all([
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
    //TODO Sepolia: fromBlock = splitter creation bloc heigth
    client.getLogs({address: splitter, event: claimedEvent, args: {token}, fromBlock: 0n}) //args: {token} filter on indexed parameters
  ])

  const claimedBy = new Map<string, bigint>()
  for (const log of logs) {
    const { member, amount } = log.args
    if (!member || amount === undefined) continue
    claimedBy.set(member.toLowerCase(), (claimedBy.get(member.toLowerCase()) ?? 0n) + amount)
  }

  return members.map((m, i) => ({
    member: m.address,
    pending: pendings[i],
    claimed: claimedBy.get(m.address.toLowerCase()) ?? 0n,
  }))
}

export async function getMemberDetail(
  client: PublicClient,
  splitter: Address,
  member: Address,
  tokens: SplitterToken[],
): Promise<MemberTokenRow[]> {
  const [pendings, logs] = await Promise.all([
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
    client.getLogs({ address: splitter, event: claimedEvent, args: { member }, fromBlock: 0n }),
  ])

  const claimedByToken = new Map<string, bigint>()
  for (const log of logs) {
    const { token, amount } = log.args
    if (!token || amount === undefined) continue
    const key = token.toLowerCase()
    claimedByToken.set(key, (claimedByToken.get(key) ?? 0n) + amount)
  }

  return tokens.map((t, i) => ({
    token: t.address,
    symbol: t.symbol,
    decimals: t.decimals,
    attributed: t.attributed,
    pending: pendings[i],
    claimed: claimedByToken.get(t.address.toLowerCase()) ?? 0n,
  }))
}
