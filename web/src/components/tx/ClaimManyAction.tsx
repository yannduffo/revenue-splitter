'use client'

import type { Address } from 'viem'
import { useClaimMany } from '@/hooks/useClaimMany'
import { TxButton } from '@/components/tx/TxButton'

export function ClaimManyAction({
  splitter, tokens, account,
}: {
  splitter: Address
  tokens: Address[]
  account: Address
}) {
  const { claimMany, status, batch, reset } = useClaimMany({ splitter, tokens, account })

  //if there arn't more than 1 token to claim, the button desapear
  if (tokens.length < 2) return null

  return (
    <div className="flex flex-col items-end gap-1">
      <TxButton
        label={`Claim all (${tokens.length})`}
        status={status}
        onClick={claimMany}
        onReset={reset}
      />
      {batch && batch.total > 1 && (
        <p className="text-[11px] text-muted">
          Transaction {batch.current} of {batch.total}
        </p>
      )}
    </div>
  )
}
