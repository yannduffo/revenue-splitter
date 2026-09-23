'use client'

import { usePublicClient } from "wagmi"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Address } from "viem"
import { isOfficialSplitter } from "@/lib/chain/factory"
import type { Splitter } from "@/lib/chain/types"

//was the contract created by our factory ? guards against look-alike contracts
export function useIsOfficialSplitter(splitter?: Address) {
  const client = usePublicClient()
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['official-splitter', splitter],
    queryFn: () => isOfficialSplitter(client!, splitter!),
    enabled: Boolean(client && splitter),
    staleTime: Infinity, //staleTime Infinity : the factory mapping is write-once.

    //the cached home list can only confirm, never refute : an address missing
    //so if it's not cached, we fall through to the call
    initialData: () => {
      if (!splitter) return undefined
      const cached = queryClient.getQueryData<Splitter[]>(['splitters'])
      const known = cached?.some(
        (s) => s.address.toLowerCase() === splitter.toLowerCase(),
      )
      return known ? true : undefined
    },
  })
}
