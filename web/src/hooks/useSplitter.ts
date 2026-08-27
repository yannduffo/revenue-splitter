'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import { Address } from "viem"
import { getSplitter } from "@/lib/chain/splitters"

export function useSplitter(address?: Address) {
  const client = usePublicClient()

  //useQuery will return(data, isLoading, error) directly passing to the useSplitter return
  return useQuery({
    queryKey: ['splitter', address],
    queryFn: () => getSplitter(client!, address!),
    enabled: Boolean(client && address),
    staleTime: Infinity, //cashes for good because splitter parameters are immutable
  })
}
