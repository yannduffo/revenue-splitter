'use client'

import { useState } from "react"
import { usePublicClient } from "wagmi"
import { useQueryClient } from "@tanstack/react-query"
import type { Address } from "viem"

import { splitterAbi } from "@/lib/generated"
import { chunk } from "@/lib/format"
import { parseTxError, type TxError } from "@/lib/errors"
import { useTx, type TxStatus } from "./useTx"

const MAX_CLAIM_BATCH = 20
const KEYS = ['token-balances', 'member-detail', 'splitter-tokens']

export function useClaimMany({
  splitter, tokens, account,
}: {
    splitter?: Address,
    tokens: Address[],
    account?:Address
  }) {
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  const tx = useTx({ invalidateKeys: KEYS })

  const [batch, setBatch] = useState<{ current: number, total: number }>()
  const [error, setError] = useState<TxError>();

  const batches = chunk(tokens, MAX_CLAIM_BATCH);

  const claimMany = async () => {
    if (!splitter || !account || batches.length === 0) return

    setError(undefined)

    for (let i = 0; i < batches.length; i++) {
      setBatch({ current: i + 1, total: batches.length })

      try {
        //simulate
        const { request } = await publicClient!.simulateContract({
          address: splitter,
          abi: splitterAbi,
          functionName: 'claimMany',
          args: [batches[i]],
          account
        })

        //useTx call
        const receipt = await tx.send(request)
        if(!receipt || receipt.status === 'reverted') break

      } catch (e) {
        setError(parseTxError(e))
        break
      }
    }

    setBatch(undefined)
    //invalidate keys to force UI/data refresh
    await Promise.all(
      KEYS.map((key) => queryClient.invalidateQueries({queryKey: [key]}))
    )
  }

  const status: TxStatus = error ? { state: 'error', error } : tx.status

  return {
    claimMany,
    status,
    batch,
    reset: () => { setError(undefined); tx.reset() }
  }
}
