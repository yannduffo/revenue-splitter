'use client'

import { useSimulateContract } from 'wagmi'
import type { Address } from 'viem'
import { demoTokenAbi } from '@/lib/generated'
import { useTx } from './useTx'
import { parseTxError } from '@/lib/errors'

// module level: useTx puts invalidateKeys in a useCallback dep list
const KEYS = ['demo-tokens', 'token-balances', 'member-detail', 'splitter-tokens', 'history']

export function useFaucet({
  token,
  account,
  enabled = true,
}: {
  token?: Address
  account?: Address
  enabled?: boolean
}) {
  const simulation = useSimulateContract({
    address: token,
    abi: demoTokenAbi,
    functionName: 'faucet',
    account,
    query: { enabled: Boolean(enabled && token && account) },
  })

  const tx = useTx({ invalidateKeys: KEYS })

  const faucet = async () => {
    if (!simulation.data?.request) return
    await tx.send(simulation.data.request)
  }

  return {
    faucet,
    status: tx.status,
    reset: tx.reset,
    isReady: Boolean(simulation.data?.request),
    isSimulating: simulation.isLoading,
    simulationError: simulation.error ? parseTxError(simulation.error) : undefined,
  }
}
