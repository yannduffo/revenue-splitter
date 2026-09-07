'use client'

import type { TxStatus } from "@/hooks/useTx"

const LABELS: Record<TxStatus['state'], string> = {
  idle: '',
  awaitingSignature: 'Check your wallet...',
  confirming: 'Confirming...',
  success: 'Done',
  reverted: 'Failed',
  error:''
}

export function TxButton({ label, status, onClick, onReset, disabled, disabledReason, isSimulating, simulationError }: {
  label: string,
  status: TxStatus,
  onClick: () => void,
  onReset: () => void,
  disabled?: boolean,
  disabledReason?: string,
  isSimulating?: boolean,
  simulationError?: {kind: string, message:string}
}) {
  const needsReset = status.state === 'error' || status.state === 'reverted'
  const busy = status.state === 'awaitingSignature' || status.state === 'confirming'

  const text =
    busy || status.state === 'success' || status.state === 'reverted'
      ? LABELS[status.state]
      : isSimulating
        ? 'Checking...'
        : label

  const blocked = needsReset ? false : disabled || busy || Boolean(simulationError)

  //returning the button with dynamic label regarding the Tx Status
  return (
      <div className="flex flex-col self-center items-end gap-1 px-2">
        <button
          type="button"
          onClick={status.state === 'error' || status.state === 'reverted' ? onReset : onClick}
          disabled={blocked}
          title={disabledReason}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm text-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status.state === 'error' || status.state === 'reverted' ? 'Retry' : text}
        </button>

        {status.state === 'error' && status.error.kind !== 'rejected' && (
          <p className="text-right text-[11px] text-muted">{status.error.message}</p>
        )}
        {status.state === 'reverted' && (
          <p className="text-right text-[11px] text-muted">Transaction reverted on-chain.</p>
        )}
        {simulationError && simulationError.kind !== 'rejected' && (
          <p className="text-right text-[11px] text-muted">{simulationError.message}</p>
        )}
      </div>
    )
}
