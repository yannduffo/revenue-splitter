'use client'

import { useState } from 'react'
import { isAddress, type Address } from 'viem'
import { usePublicClient } from 'wagmi'
import { isErc20 } from '@/lib/chain/tokens'

//TODO : refaire le style de l'ajout manuel de token :
// il doit être plus discret car la foncitonnalité ne devrait pas être très utilisée
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
    <div className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(undefined)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="0x… track a token manually"
          className="flex-1 rounded-lg border border-rule bg-surface px-3 py-1.5 font-mono text-sm"
        />
        <button
          type="button"
          onClick={submit}
          disabled={isChecking || !value.trim()}
          className="rounded-lg border border-rule px-3 py-1.5 text-sm disabled:opacity-40"
        >
          {isChecking ? 'Checking…' : 'Add'}
        </button>
      </div>
      {error && <p className="text-[11px] text-muted">{error}</p>}
    </div>
  )
}
