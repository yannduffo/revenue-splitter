'use client'

import { SplitterRow } from './SplitterRow'
import type { Splitter } from '@/lib/chain/types'
import type { SplitterRole } from '@/hooks/useSplitters'

export function SplitterList({
  title, entries, isLoading, empty,
}: {
  title: string
  entries: { splitter: Splitter; role: SplitterRole }[]
  isLoading?: boolean
  empty: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs uppercase tracking-wide text-muted">{title}</h2>
        {entries.length > 0 && (
          <span className="text-xs text-muted">{entries.length}</span>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-rule bg-surface">
        {!isLoading && entries.length > 0 && (
          <div className="hidden sm:grid-cols-[minmax(0,1fr)_240px_100px] gap-2 border-b border-rule bg-paper/40 px-4 py-2 text-[10px] uppercase tracking-wide text-muted sm:grid">
            <span>Splitter</span>
            <span>Distribution</span>
            <span className="text-right">Members</span>
          </div>
        )}

        {isLoading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <div className="p-6 text-sm text-muted">{empty}</div>
        ) : (
          entries.map((entry) => (
            <SplitterRow key={entry.splitter.address} {...entry} />
          ))
        )}
      </div>
    </section>
  )
}
