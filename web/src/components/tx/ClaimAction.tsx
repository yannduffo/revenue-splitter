'use client'

import type { Address } from 'viem'
import { useClaim } from '@/hooks/useClaim'
import { TxButton } from '@/components/tx/TxButton'

//using a component so we don't call a hook directly in the memberCard map
export function ClaimAction({
  splitter, token, account, pending,
}: {
  splitter: Address
  token: Address
  account: Address
  pending: bigint
}) {
  const hasPending = pending > 0n
  const claim = useClaim({ splitter, token, account, enabled: hasPending })

  return (
    <TxButton
      label="Claim"
      status={claim.status}
      onClick={claim.claim}
      onReset={claim.reset}
      disabled={!hasPending || !claim.isReady}
      disabledReason={hasPending ? undefined : 'Not enough accrued yet'}
      isSimulating={claim.isSimulating}
      simulationError={claim.simulationError}
    />
  )
}
