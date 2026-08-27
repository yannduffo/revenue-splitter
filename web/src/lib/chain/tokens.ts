import { erc20Abi, type Address, type PublicClient } from "viem";
import { splitterAbi } from "@/lib/generated";
import type { SplitterToken } from "./types";

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
