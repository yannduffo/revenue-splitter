'use client'

import { useMemo } from "react"
import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import { listSplitters } from "@/lib/chain/factory"
import { useConnectedMember } from "./useConnectedMember"

export type SplitterRole = 'creator' | 'member' | 'none'

export function useSplitters() {
  const client = usePublicClient()
  const { address } = useConnectedMember()

  //calling listSplitters from lib/ to get the table of all splitters
  const query = useQuery({
    queryKey: ['splitters'],
    queryFn: () => listSplitters(client!),
    enabled: Boolean(client)
  })

  //checking connected user "role" in each splitters (splitter table = query.data)
  const withRole = useMemo(() => {
    const me = address?.toLowerCase()

    return (query.data ?? []).map((splitter) => {
      let role: SplitterRole = 'none'

      if (me) {
        if (splitter.creator.toLowerCase() === me) role = 'creator'
        else if(splitter.members.some((m) => m.address.toLowerCase() === me )) role = 'member'
      }
      return {splitter, role}
    })
  }, [query.data, address])

  //returning structured object with query properties + all + mine
  return {
    ...query,
    all: withRole,
    mine: withRole.filter((entry) => entry.role !== 'none')
  }
}
