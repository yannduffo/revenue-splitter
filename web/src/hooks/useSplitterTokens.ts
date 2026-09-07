'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import { discoverTokens, getSplitterTokens } from "@/lib/chain/tokens"
//import { DEV_TOKENS } from "@/lib/chain/config"

export function useSplitterTokens(splitter?: Address, extra: Address[] = []) {
  const client = usePublicClient()
  const extraKey = extra.map((t) => t.toLowerCase()).sort().join(',')

  //querying lib/chain/tokens.ts/getSplitterTokens()
  return useQuery({
    queryKey: ['splitter-tokens', splitter, extraKey],
    queryFn: async () => {
      const discovered = await discoverTokens(client!, splitter!)

      const seen = new Set(discovered.map((t) => t.toLowerCase()))
      const merged = [...discovered]
      //creating the final table with automatically discoverd tokens + manually add ones without double addresses
      for (const token of extra) {
        if(!seen.has(token.toLowerCase())) merged.push(token)
      }

      return getSplitterTokens(client!, splitter!, merged)
    },
    enabled: Boolean(client && splitter),
  })

  /* DEV PURPOSE WITH FIXED TOKEN LIST
  return useQuery({
    queryKey: ['splitter-tokens', splitter],
    queryFn: () => getSplitterTokens(client!, splitter!, DEV_TOKENS),
    enabled: Boolean(client && splitter), //checking existance before lunching query
  })
  */
}
