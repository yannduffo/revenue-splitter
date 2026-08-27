import type { Address, PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { Splitter } from "./types";

export async function getSplitter(
  client: PublicClient,
  address: Address,
): Promise<Splitter> {
  const memberAddresses = await client.readContract({
    address,
    abi: splitterAbi,
    functionName: "getMembers",
  });

  //TODO: put the multicall back when we deploy on testnet
  //TODO: we could also deploy multicall conrtract on the anvil chain in our seedLocal.s.sol
  // const shares = await client.multicall({
  //   contracts: memberAddresses.map((member) => ({
  //     address,
  //     abi: splitterAbi,
  //     functionName: "getMemberShares",
  //     args: [member],
  //   })),
  //   allowFailure: false, //return object are 'result' and not {status, result}
  // });

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
