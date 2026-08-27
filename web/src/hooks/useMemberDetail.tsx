'use client'
import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import { getMemberDetail } from "@/lib/chain/balance"
import type { SplitterToken } from "@/lib/chain/types"

export function useMemberDetail(
  splitter?: Address,
  member?: Address,
  tokens?:SplitterToken[],
) {
  const client = usePublicClient()
  return useQuery({
    queryKey: ['member-detail', splitter, member],
    queryFn: () => getMemberDetail(client!, splitter!, member!, tokens!),
    enabled: Boolean(client && splitter && member && tokens?.length), //enable over member make the query doesn't happen until we print de member card detail
  })
}
