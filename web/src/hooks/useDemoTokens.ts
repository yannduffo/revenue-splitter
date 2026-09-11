'use client'

import { usePublicClient } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { demoTokenAbi } from '@/lib/generated'
import { DEMO_TOKENS } from '@/lib/chain/config'

export type DemoTokenInfo = {
  address: Address
  symbol: string
  decimals: number
  balance: bigint
}

// own query key so useTx invalidation can refresh balances after a faucet
export function useDemoTokens(account?: Address) {
  const client = usePublicClient()

  const query = useQuery({
    queryKey: ['demo-tokens', account],
    queryFn: async (): Promise<DemoTokenInfo[]> =>
      Promise.all(
        DEMO_TOKENS.map(async (address) => {
          const [symbol, decimals, balance] = await Promise.all([
            client!.readContract({ address, abi: demoTokenAbi, functionName: 'symbol' }),
            client!.readContract({ address, abi: demoTokenAbi, functionName: 'decimals' }),
            account
              ? client!.readContract({
                  address,
                  abi: demoTokenAbi,
                  functionName: 'balanceOf',
                  args: [account],
                })
              : Promise.resolve(0n),
          ])
          return { address, symbol, decimals, balance }
        }),
      ),
    enabled: Boolean(client && DEMO_TOKENS.length),
  })

  return { tokens: query.data ?? [], isLoading: query.isLoading }
}
