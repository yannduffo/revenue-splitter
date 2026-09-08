'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSplitters } from '@/hooks/useSplitters'
import { useConnectedMember } from '@/hooks/useConnectedMember'
import { SplitterList } from '@/components/splitter/SplitterList'
import { SearchBar } from '@/components/SearchBar'

export default function Home() {
  const [search, setSearch] = useState('')
  const { all, mine, isLoading, error } = useSplitters()
  const { address } = useConnectedMember()

  const filter = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!filter) return { all, mine }
    const match = (entry: (typeof all)[number]) =>
      entry.splitter.address.toLowerCase().includes(filter) ||
      entry.splitter.members.some((m) => m.address.toLowerCase().includes(filter))
    return { all: all.filter(match), mine: mine.filter(match) }
  }, [all, mine, filter])

  return (
    <main className="mx-auto flex max-w-275 flex-col gap-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">Splitters</h1>
        <Link
          href="/create"
          className="rounded-lg bg-accent px-3 py-1.5 text-sm text-paper"
        >
          New splitter
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} />

      {error && (
        <p className="rounded-xl border border-rule bg-surface p-4 text-sm text-muted">
          Could not read the factory. Is the chain reachable?
        </p>
      )}

      <SplitterList
        title="Yours"
        entries={filtered.mine}
        isLoading={isLoading}
        empty={
          address
            ? "You're not part of any splitter yet."
            : 'Connect your wallet to see the splitters you belong to.'
        }
      />

      <SplitterList
        title="All splitters"
        entries={filtered.all}
        isLoading={isLoading}
        empty="No splitter has been created yet."
      />
    </main>
  )
}
