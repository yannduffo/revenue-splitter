import type { Address, PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { Splitter } from "./types";

export async function getSplitter(
  client: PublicClient,
  address: Address,
): Promise<Pick<Splitter, 'address' | 'members'>> {
  const memberAddresses = await client.readContract({
    address,
    abi: splitterAbi,
    functionName: "getMembers",
  });

  const shares = await Promise.all(
    memberAddresses.map((member) =>
      client.readContract({
        address,
        abi: splitterAbi,
        functionName: "getMemberShares",
        args: [member],
      }),
    ),
  );

  const members = memberAddresses
    .map((member, i) => ({ address: member, shareBps: Number(shares[i]) }))
    .sort((a, b) => b.shareBps - a.shareBps);

  return {address, members}
}
