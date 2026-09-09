import { parseAbiItem, erc20Abi, type Address, type PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { SplitterToken } from "./types";
import { useSplitterBlock } from "@/hooks/useSplitterBlock";

//building our own "event Abi" so we don't need to import it
const transferEvent = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)")

//TODO For a specified token address, symbol & decimals never changes
// we could take them out from the readContract after the first read
export async function getSplitterTokens(
  client: PublicClient,
  splitter: Address,
  tokens: Address[],
): Promise<SplitterToken[]> {
  // return the table of SplitterToken elements which individually describes
  // each token of the splitter
  return Promise.all(
    tokens.map(async (token) => {
      const [symbol, decimals, held, attributed, claimed] = await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: 'symbol' }),
        client.readContract({ address: token, abi: erc20Abi, functionName: 'decimals' }),
        client.readContract({ address: token, abi: erc20Abi, functionName: 'balanceOf', args: [splitter] }),
        client.readContract({ address: splitter, abi: splitterAbi, functionName: 'getTotalAttributed', args: [token] }),
        client.readContract({ address: splitter, abi: splitterAbi, functionName: 'getTotalClaimed', args: [token] }),
      ])

      return {
        address: token,
        symbol,
        decimals,
        held,
        attributed,
        claimed,
        unattributed: held - (attributed - claimed),
      }
    })
  )
}

//discovering tokens by exploring RPC logs of every ERC20 Transfer event with "to === splitterAddress"
export async function discoverTokens(
  client: PublicClient,
  splitter: Address,
  blockheigth : bigint
): Promise<Address[]>{
  const logs = await client.getLogs({
    event: transferEvent,
    args: { to: splitter },
    fromBlock: blockheigth,
    toBlock: 'latest'
  })

  const seen = new Set<string>()
  const tokens: Address[] = []

  for (const log of logs) {
    if (log.topics.length !== 3) continue //not considering ERC721 (a NFT event has 4 topics)
    const key = log.address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    tokens.push(log.address)
  }

  return tokens
}

// helper function to check if an address is an ERC-20 contract (calling "decimals" func that should be implemented in every ERC-20)
// not true in every case but minimal for our use case
export async function isErc20(client: PublicClient, address: Address): Promise<boolean> {
  try {
    await client.readContract({ address, abi: erc20Abi , functionName: 'decimals'})
    return true
} catch {
    return false
  }
}
