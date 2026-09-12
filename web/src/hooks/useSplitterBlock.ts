'use client'

import { usePublicClient } from "wagmi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Address } from "viem"
import { getSplitterBlock } from "@/lib/chain/factory"
import type { Splitter } from "@/lib/chain/types"

//get and cache with infinity staletime the block heigth of splitter creation
export function useSplitterBlock(splitter?: Address) {
  const client = usePublicClient();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['splitter-block', splitter],
    queryFn: () => getSplitterBlock(client!, splitter!),
    enabled: Boolean(client && splitter),
    staleTime: Infinity, //cause the block heigth creation will never change

    //listSplitters already returns createdAtBlock : reuse it instead of paying
    initialData: () => {
      if (!splitter) return undefined
      const cached = queryClient.getQueryData<Splitter[]>(['splitters'])
      return cached?.find(
        (s) => s.address.toLowerCase() === splitter.toLowerCase(),
      )?.createdAtBlock
    },
  })
}
