'use client'

import { useQuery } from "@tanstack/react-query"
import type { Address } from "viem"
import {getHistory} from "@/lib/chain/history"

export function useHistory(splitter?:Address) {
  return useQuery({
    queryKey: ['history', splitter],
    queryFn: () => getHistory(splitter!),
    enabled: Boolean(splitter)
  })
}
