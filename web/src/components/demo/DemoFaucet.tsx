'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { parseUnits, type Address } from 'viem'

import { useConnectedMember } from '@/hooks/useConnectedMember'
import { useDemoTokens } from '@/hooks/useDemoTokens'
import { useFaucet } from '@/hooks/useFaucet'
import { useSendToken } from '@/hooks/useSendToken'
import { TxButton } from '@/components/tx/TxButton'
import { formatAmount } from '@/lib/format'
import { EXPECTED_CHAIN } from '@/lib/chain/config'

const AMOUNT_RE = /^\d*\.?\d*$/

export function DemoFaucet({ splitter }: { splitter?: Address }) {
  const { address, canAct } = useConnectedMember()
  const { isConnected } = useAccount()
  const { tokens, isLoading } = useDemoTokens(address)

  const [selected, setSelected] = useState<Address>()
  const [amount, setAmount] = useState('')

  const token = tokens.find((t) => t.address === selected) ?? tokens[0]

  let parsed: bigint | undefined
  if (token && AMOUNT_RE.test(amount.trim()) && amount.trim() !== '' && amount.trim() !== '.') {
    try {
      parsed = parseUnits(amount.trim(), token.decimals)
    } catch {
      parsed = undefined
    }
  }

  const faucet = useFaucet({ token: token?.address, account: address, enabled: canAct })
  const transfer = useSendToken({
    token: token?.address,
    to: splitter,
    amount: parsed,
    account: address,
    enabled: canAct,
  })

  if (!canAct) {
    return (
      <section className="flex flex-col gap-2 text-sm text-muted">
        <h3 className="text-sm uppercase tracking-wide text-muted">Interact</h3>
        <p className='font-medium'>
          {isConnected
            ? `Switch your wallet to ${EXPECTED_CHAIN.name} to use these tools.`
            : 'Connect your wallet to get test tokens and send them to a splitter.'}
        </p>
        <p>
          You also need some {EXPECTED_CHAIN.name} ETH for gas. You can get some by pouring from public faucets.
        </p>
      </section>
    )
  }

  if (isLoading) return <p className="text-sm text-muted">Loading…</p>
  if (!tokens.length) return <p className="text-sm text-muted">No demo token configured.</p>

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        {tokens.map((t) => (
          <button
            key={t.address}
            type="button"
            onClick={() => setSelected(t.address)}
            className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              t.address === token?.address
                ? 'border-accent bg-surface'
                : 'border-rule bg-surface text-muted hover:border-muted'
            }`}
          >
            <span className="font-mono">{t.symbol}</span>
            <span className="font-mono text-xs">
              {formatAmount(t.balance, t.decimals)}
            </span>
          </button>
        ))}
      </div>

      <TxButton
        label="Get test tokens"
        status={faucet.status}
        onClick={faucet.faucet}
        onReset={faucet.reset}
        disabled={!faucet.isReady}
        isSimulating={faucet.isSimulating}
        simulationError={faucet.simulationError}
      />

      {splitter && (
        <div className="flex flex-col gap-2 border-t border-rule pt-3">
          <input
            value={amount}
            onChange={(e) => {
              if (AMOUNT_RE.test(e.target.value)) setAmount(e.target.value)
            }}
            inputMode="decimal"
            placeholder={`Amount in ${token?.symbol ?? ''}`}
            className="rounded-lg border border-rule bg-surface px-3 py-1.5 font-mono text-sm outline-none focus:border-muted"
          />
          <TxButton
            label="Send to this splitter"
            status={transfer.status}
            onClick={transfer.send}
            onReset={transfer.reset}
            disabled={!transfer.isReady}
            disabledReason={parsed === undefined ? 'Enter an amount' : undefined}
            isSimulating={transfer.isSimulating}
            simulationError={transfer.simulationError}
          />
        </div>
      )}
    </section>
  )
}
