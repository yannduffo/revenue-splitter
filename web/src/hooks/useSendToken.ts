'use client'

import { useSimulateContract } from 'wagmi'
import type { Address } from 'viem'
import { demoTokenAbi } from '@/lib/generated'
import { useTx } from './useTx'
import { parseTxError } from '@/lib/errors'

const KEYS = ['demo-tokens', 'token-balances', 'member-detail', 'splitter-tokens', 'history']

export function useSendToken({
  token,
  to,
  amount,
  account,
  enabled = true,
}: {
  token?: Address
  to?: Address
  amount?: bigint
  account?: Address
  enabled?: boolean
}) {
  const simulation = useSimulateContract({
    address: token,
    abi: demoTokenAbi,
    functionName: 'transfer',
    args: to && amount !== undefined ? [to, amount] : undefined,
    account,
    query: {
      enabled: Boolean(enabled && token && to && account && amount !== undefined && amount > 0n),
    },
  })

  const tx = useTx({ invalidateKeys: KEYS })

  const send = async () => {
    if (!simulation.data?.request) return
    await tx.send(simulation.data.request)
  }

  return {
    send,
    status: tx.status,
    reset: tx.reset,
    isReady: Boolean(simulation.data?.request),
    isSimulating: simulation.isLoading,
    simulationError: simulation.error ? parseTxError(simulation.error) : undefined,
  }
}
