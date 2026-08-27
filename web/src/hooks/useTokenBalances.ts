'use client'
import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import { getTokenBalances } from "@/lib/chain/balance"
import type { Member } from "@/lib/chain/types"

export function useTokenBalances(splitter?: Address, token?: Address, members?: Member[]) {
  const client = usePublicClient();

  //querying lib/chain/balances.ts/getTokenBalances()
  return useQuery({
    queryKey: ['token-balances', splitter, token],
    queryFn: () => getTokenBalances(client!, splitter!, token!, members!),
    enabled: Boolean(client && splitter && token && members?.length)
  })
}
