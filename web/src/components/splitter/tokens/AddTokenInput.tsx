'use client'

import { useState } from 'react'
import { isAddress, type Address } from 'viem'
import { usePublicClient } from 'wagmi'

import { isErc20 } from '@/lib/chain/tokens'

export function AddTokenInput({ onAdd }: { onAdd: (token: Address) => void }) {
  const client = usePublicClient()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string>()
  const [isChecking, setIsChecking] = useState(false)

  const submit = async () => {
    const trimmed = value.trim()

    if (!isAddress(trimmed)) {
      setError('Not a valid address.')
      return
    }

    setIsChecking(true)
    setError(undefined)

    const valid = await isErc20(client!, trimmed)
    setIsChecking(false)

    if (!valid) {
      setError('This address is not an ERC-20 token.')
      return
    }

    onAdd(trimmed)
    setValue('')
  }

  return (
      <div className="flex flex-col gap-1 pb-1">
        <div className="flex gap-2">
          {/* input bar */}
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(undefined);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
            placeholder="0x… ERC-20 token address"
            spellCheck={false}
            className="flex-1 rounded-lg border border-rule bg-surface px-3 py-1.5 font-mono text-sm"
          />

          {/* Add button */}
          <button
            type="button"
            onClick={submit}
            disabled={isChecking || !value.trim()}
            className="rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm transition-colors hover:border-muted disabled:opacity-40"
          >
            {isChecking ? "Checking…" : "Add"}
          </button>
        </div>

        {/* Error printing */}
        <div
          className={`overflow-hidden transition-all duration-200 ${
            error
              ? "max-h-8 opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <p className="pt-1 text-[11px] text-muted">
            {error}
          </p>
        </div>
      </div>
    );
}
