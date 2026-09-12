'use client'
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

//was driven by useBlockNumber({watch:true}) : one eth_blockNumber every 12s = 80 credits
// Nothing displays the block number so a plain interval does the same job for free
const DEFAULT_INTERVAL_MS = 30_000

/**
 * Periodically invalidate queries cache, only while the tab is visible
 * @param keys
 * @param intervalMs
 */
export function useInvalidateOnInterval(
  keys: string[],
  intervalMs = DEFAULT_INTERVAL_MS,
) {
  const queryClient = useQueryClient()
  const signature = keys.join('|')

  useEffect(() => {
    const timer = setInterval(() => {
      //refetching behind a hidden tab is pure waste : react-query refetches on focus anyway
      if (document.visibilityState !== 'visible') return

      for (const key of signature.split('|')) {
        queryClient.invalidateQueries({ queryKey: [key] })
      }
    }, intervalMs)

    return () => clearInterval(timer)
  }, [signature, queryClient, intervalMs])
}
