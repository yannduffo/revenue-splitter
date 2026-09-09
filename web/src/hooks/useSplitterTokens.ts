'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import { useSplitterBlock } from "./useSplitterBlock"
import type { Address } from "viem"
import { discoverTokens, getSplitterTokens } from "@/lib/chain/tokens"
//import { DEV_TOKENS } from "@/lib/chain/config"

export function useSplitterTokens(
  splitter?: Address,
  extra: Address[] = [],
  fromBlock?: bigint
) {
  const client = usePublicClient()
  const extraKey = extra.map((t) => t.toLowerCase()).sort().join(',')

  //querying lib/chain/tokens.ts/getSplitterTokens()
  return useQuery({
    queryKey: ['splitter-tokens', splitter, extraKey, fromBlock?.toString()],
    queryFn: async () => {
      const discovered = await discoverTokens(client!, splitter!, fromBlock!)

      const seen = new Set(discovered.map((t) => t.toLowerCase()))
      const merged = [...discovered]
      //creating the final table with automatically discoverd tokens + manually add ones without double addresses
      for (const token of extra) {
        if(!seen.has(token.toLowerCase())) merged.push(token)
      }

      return getSplitterTokens(client!, splitter!, merged)
    },
    enabled: Boolean(client && splitter && fromBlock !== undefined),
  })

  /* DEV PURPOSE WITH FIXED TOKEN LIST
  return useQuery({
    queryKey: ['splitter-tokens', splitter],
    queryFn: () => getSplitterTokens(client!, splitter!, DEV_TOKENS),
    enabled: Boolean(client && splitter), //checking existance before lunching query
  })
  */
}
