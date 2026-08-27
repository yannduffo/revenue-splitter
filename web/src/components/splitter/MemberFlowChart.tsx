import { formatAmount } from '@/lib/format'
import { deriveMemberFlow } from '@/lib/chain/derive'

export function MemberFlowChart({
  pending, claimed, decimals, symbol,
}: {
  pending: bigint
  claimed: bigint
  decimals: number
  symbol: string
}) {
  const flow = deriveMemberFlow({ pending, claimed })

  if (flow.isEmpty) {
    return <p className="flex h-full items-center text-xs text-muted">Nothing accrued yet</p>
  }

  const rows = [
    { label: 'Pending', value: pending, r: flow.pendingRatio, bg: 'var(--color-accent)' },
    { label: 'Claimed', value: claimed, r: flow.claimedRatio, bg: 'var(--color-accent)' },
  ]

  return (
    <div className="w-full min-w-0 space-y-1.5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center gap-2">
          {/* "pending / claimed" */}
          <span className="shrink-0 text-[11px] text-muted">{row.label}</span>

          {/* bar */}
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full" style={{ width: `${row.r * 100}%`, background: row.bg }} />
          </div>

          {/* amount */}
          <span className="w-8 shrink-0 text-right font-mono text-[11px]">
            {formatAmount(row.value, decimals)}
          </span>

        </div>
      ))}

      <p className="pt-0.5 text-right font-mono text-[11px] text-muted">
        {formatAmount(flow.allTime, decimals)} {symbol} all time
      </p>
    </div>
  )
}
