'use client'

import { usePublicClient } from "wagmi"
import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import {getHistory} from "@/lib/chain/history"

export function useHistory(splitter?:Address, fromBlock?:bigint) {
  const client = usePublicClient();

  return useQuery({
    queryKey: ['history', splitter, fromBlock?.toString()],
    queryFn: () => getHistory(client!, splitter!, fromBlock!),
    enabled: Boolean(client && splitter && fromBlock !== undefined)
  })
}
