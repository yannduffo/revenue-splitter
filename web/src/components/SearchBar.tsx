'use client'

import { useRouter } from 'next/navigation'
import { isAddress } from 'viem'

export function SearchBar({
  value, onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const router = useRouter()
  const trimmed = value.trim()
  const isFullAddress = isAddress(trimmed)

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && isFullAddress) router.push(`/s/${trimmed}`)
        }}
        placeholder="0x... search a splitter address"
        className="flex-1 rounded-lg border border-rule bg-surface px-3 py-2 font-mono text-sm placeholder:font-sans"
      />
      {isFullAddress && (
        <button
          type="button"
          onClick={() => router.push(`/s/${trimmed}`)}
          className="rounded-lg bg-accent px-3 py-2 text-sm text-paper"
        >
          Open
        </button>
      )}
    </div>
  )
}
