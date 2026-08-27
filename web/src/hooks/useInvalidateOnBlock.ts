'use client'
import { useEffect } from "react"
import { useBlockNumber } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Invalid queries cache on blockNumber or keys changes
 * @param keys
 */
export function useInvalidateOnBlock(keys: string[]) {
  const queryClient = useQueryClient()
  const { data: blockNumber } = useBlockNumber({ watch: true }) //watching for new blocks and updating blockNumber
  const signature = keys.join('|')

  useEffect(() => {
    if (!blockNumber) return
    for (const key of signature.split('|')) {
      queryClient.invalidateQueries({queryKey: [key]}) //invalidate every queries starting with the designated key
    }
    // useEffect started each new block
    // also on signature change (so underneath keys changes (signature is use
    // to compare 2 strings and not to arrays))
  },[blockNumber, signature, queryClient])
}
