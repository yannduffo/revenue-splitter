'use client'

import type { Address } from 'viem'
import { useClaim } from '@/hooks/useClaim'
import { TxButton } from '@/components/tx/TxButton'
import { EXPECTED_CHAIN } from '@/lib/chain/config'

//using a component so we don't call a hook directly in the memberCard map
export function ClaimAction({
  splitter, token, account, pending, canAct
}: {
  splitter: Address
  token: Address
  account: Address
  pending: bigint
  canAct?: boolean
}) {
  const hasPending = pending > 0n
  const claim = useClaim({ splitter, token, account, enabled: hasPending && canAct })

  return (
    <TxButton
      label="Claim"
      status={claim.status}
      onClick={claim.claim}
      onReset={claim.reset}
      disabled={!canAct || !hasPending || !claim.isReady}
      disabledReason={
        !canAct
          ? `Switch to ${EXPECTED_CHAIN.name} to claim`
          : hasPending ? undefined : 'Not enough accrued yet'
      }
      isSimulating={claim.isSimulating}
      simulationError={claim.simulationError}
    />
  )
}
