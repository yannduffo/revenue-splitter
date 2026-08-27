'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import { getSplitterTokens } from "@/lib/chain/tokens"
import { DEV_TOKENS } from "@/lib/chain/config"

export function useSplitterTokens(splitter?: Address) {
  const client = usePublicClient()

  //querying lib/chain/tokens.ts/getSplitterTokens()
  return useQuery({
    queryKey: ['splitter-tokens', splitter],
    queryFn: () => getSplitterTokens(client!, splitter!, DEV_TOKENS),
    enabled: Boolean(client && splitter), //checking existance before lunching query
  })
}
