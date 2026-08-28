'use client'

//lib/
import {formatBps, shareTone, shortenAddress } from '@/lib/format'
import type { Member, MemberBalance, SplitterToken } from '@/lib/chain/types'
import type { MemberTokenRow } from '@/lib/chain/balance'

//components/
import { MemberFlowChart } from './MemberFlowChart'

import { User } from 'lucide-react'

export function MemberCard({
  member, index, total, balance, token, isOpen, onToggle, isConnected, detail, isLoadingDetail,
}: {
  member: Member
  index: number
  total: number
  balance?: MemberBalance
  token: SplitterToken
  isOpen: boolean
  onToggle: () => void
  isConnected?: boolean
  detail?: MemberTokenRow[]
  isLoadingDetail?: boolean
  }) {
  //TODO : ajouter une icone pour fermer la grande card plutot que le clic sur l'entête
  return (
    <div
      className={`w-full rounded-xl border-x border-b border-rule bg-surface p-3 ${isOpen ? 'col-span-full' : ''}`}
      style={{ borderTop: `2px solid ${shareTone(index, total).bg}` }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="block w-full text-left"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="flex gap-1 font-mono text-xs text-muted">
              <User size={16} />
              {shortenAddress(member.address)}
              {isConnected && (
                <span className="self-center rounded bg-accent px-1.5 py-0.5 text-[10px] text-paper">you</span>
              )}
            </span>
            <span className="text-xs text-muted">{formatBps(member.shareBps)}</span>
          </div>

          {!isOpen && (
            <MemberFlowChart
              pending={balance?.pending ?? 0n}
              claimed={balance?.claimed ?? 0n}
              decimals={token.decimals}
              symbol={token.symbol}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 border-t border-rule">
          {isLoadingDetail && <p className="text-sm text-muted pt-3">Loading…</p>}

          {detail?.map((row) => {
            return (
              <div
                key={row.token}
                className="flex gap-3 border-b border-rule py-2 last:border-0"
              >
                <span className="w-12 shrink-0 font-mono text-sm">{row.symbol}</span>
                <div className="min-w-0 flex-1">
                  <MemberFlowChart
                    pending={row.pending ?? 0n}
                    claimed={row.claimed ?? 0n}
                    decimals={row.decimals}
                    symbol={row.symbol}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
