'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import { getSplitterBlock } from "@/lib/chain/factory"

//get and cache with infinity staletime the block heigth of splitter creation
export function useSplitterBlock(splitter?: Address) {
  const client = usePublicClient();

  return useQuery({
    queryKey: ['splitter-block', splitter],
    queryFn: () => getSplitterBlock(client!, splitter!),
    enabled: Boolean(client && splitter),
    staleTime: Infinity, //cause the block heigth creation will never change
  })
}
