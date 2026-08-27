import { getAbiItem, type Address, type PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { Member, MemberBalance } from "./types";

const claimedEvent = getAbiItem({ abi: splitterAbi, name: "Claimed" });

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

//get all the pending values for the designated token array for the designated member
export async function getPendingForMember(
  client: PublicClient,
  splitter: Address,
  member: Address,
  tokens: Address[],
): Promise<Record<Address, bigint>> {
  const amounts = await Promise.all(
    tokens.map((token) =>
      client.readContract({
        address: splitter,
        abi: splitterAbi,
        functionName: "pending",
        args: [token, member],
      }),
    ),
  );
  return Object.fromEntries(tokens.map((t,i) => [t, amounts[i]])) as Record<Address, bigint>
}
