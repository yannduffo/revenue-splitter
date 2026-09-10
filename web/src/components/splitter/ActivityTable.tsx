'use client'

import { ArrowDownLeft, ArrowUpRight, Sparkles, ExternalLink } from 'lucide-react'
import { formatAmount} from '@/lib/format'
import { explorerUrl } from '@/lib/chain/config'
import type { HistoryEntry } from '@/lib/chain/history'
import type { SplitterToken } from '@/lib/chain/types'

const ICONS = {
  created: Sparkles,
  deposit: ArrowDownLeft,
  claim: ArrowUpRight,
}

const LABELS = {
  created: 'Created',
  deposit: 'Deposit',
  claim: 'Claim',
}

function formatDate(timestamp?: bigint) {
  if (!timestamp) return null
  return new Date(Number(timestamp) * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityTable({
  entries, tokens, isLoading,
}: {
  entries?: HistoryEntry[]
  tokens?: SplitterToken[]
  isLoading?: boolean
}) {
  const tokenOf = (address?: string) =>
    tokens?.find((t) => t.address.toLowerCase() === address?.toLowerCase())

  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-surface">
      <div className="grid grid-cols-[100px_minmax(0,1fr)_140px_120px] gap-3 border-b border-rule  bg-paper/40 px-4 py-2 text-[11px] uppercase tracking-wide text-muted">
        <span>Event</span>
        <span>Account</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Date</span>
      </div>

      <div className='max-h-90 overflow-y-auto'>
        {isLoading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : !entries?.length ? (
          <p className="p-6 text-sm text-muted">No activity yet.</p>
        ) : (
          entries.map((entry) => {
            const Icon = ICONS[entry.kind]
            const token = tokenOf(entry.token)
            const url = explorerUrl('tx', entry.txHash)
            const date = formatDate(entry.timestamp)

            return (
              <div
                key={entry.id}
                className="grid grid-cols-[100px_minmax(0,1fr)_140px_120px] items-center gap-3 border-b border-rule px-4 py-2.5 text-sm last:border-0"
              >
                <span className="flex items-center gap-1.5 text-xs">
                  <Icon size={14} className="text-muted" />
                  {LABELS[entry.kind]}
                </span>

                <span className="truncate font-mono text-xs text-muted">
                  {/* entry.actor ? shortenAddress(entry.actor, 6) : '—' */}
                  {entry.actor ? entry.actor : '—'}
                  {entry.kind === 'created' && entry.memberCount
                    ? ` · ${entry.memberCount} members`
                    : ''}
                </span>

                <span className="text-right font-mono text-xs">
                  {entry.amount !== undefined ? (
                    token ? (
                      <>
                        {formatAmount(entry.amount, token.decimals)}{' '}
                        <span className="text-muted">{token.symbol}</span>
                      </>
                    ) : (
                      <span className="text-muted" title={entry.token}>
                        unknown token
                      </span>
                    )
                  ) : (
                    '—'
                  )}
                </span>

                <span className="flex items-center justify-end gap-1.5 text-xs text-muted">
                  {date ?? `#${entry.blockNumber.toString()}`}
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer" className="hover:text-accent">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </span>
              </div>
            )
          })
        )}
      </div>


    </div>
  )
}
