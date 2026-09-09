import { getAbiItem, type Address, type PublicClient } from "viem";
import { splitterFactoryAbi } from "@/lib/generated";
import { FACTORY_ADDRESS, FACTORY_BLOCK } from "./config";
import type { Splitter } from "./types";

const createdEvent = getAbiItem({
  abi: splitterFactoryAbi,
  name: "SplitterCreated",
});

//Reading the logs since Facroty creating to list all splitter ever created
export async function listSplitters(client: PublicClient): Promise<Splitter[]> {
  const logs = await client.getLogs({
    address: FACTORY_ADDRESS,
    event: createdEvent,
    fromBlock: FACTORY_BLOCK,
    toBlock: "latest",
  });

  //from the corresponding log, we retrun a Splitter table
  return logs
    .map((log) => {
      const { splitter, creator, members, shareDistribution } = log.args;
      if (!splitter || !creator || !members || !shareDistribution)
        return undefined;

      //retrunring Splitter type variable (built with the map on logs event)
      return {
        address: splitter,
        creator,
        createdAtBlock: log.blockNumber,
        members: members
          .map((address, i) => ({
            address,
            shareBps: Number(shareDistribution[i]),
          }))
          .sort((a, b) => b.shareBps - a.shareBps), //decreasing sort
      } satisfies Splitter;
    })
    .filter((s): s is Splitter => s !== undefined)
    .reverse(); //sort latest first
}

//js function to call isOfficialSplitter solidity func
export async function isOfficialSplitter(
  client: PublicClient,
  address:Address,
): Promise<boolean> {
  return client.readContract({
    address: FACTORY_ADDRESS,
    abi: splitterFactoryAbi,
    functionName: 'isOfficialSplitter',
    args: [address]
  })
}

//getting the splitter block creating heigth to optimise futur logs exploration
export async function getSplitterBlock(
  client: PublicClient,
  splitter: Address,
): Promise<bigint> {
  const logs = await client.getLogs({
    address: FACTORY_ADDRESS,
    event: createdEvent,
    args: { splitter }, //splitter address is indexed on createdEvent
    fromBlock: FACTORY_BLOCK,
    toBlock: 'latest',
  })

  return logs[0]?.blockNumber ?? FACTORY_BLOCK
}
