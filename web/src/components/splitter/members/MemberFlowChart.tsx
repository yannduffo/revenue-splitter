import { Fragment } from 'react'
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

  // 2 tints for a better differenciation between pending and claimed
  const rows = [
    { label: 'Pending', value: pending, r: flow.pendingRatio, bg: 'var(--color-accent)' },
    { label: 'Claimed', value: claimed, r: flow.claimedRatio, bg: 'color-mix(in srgb, var(--color-accent) 70%, var(--color-surface))' },
  ]

  return (
    // using a grid so the bar width adapt to amount width at the end of the row
    <div className="grid w-full min-w-0 grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5">
      {rows.map((row) => (
        <Fragment key={row.label}>
          {/* "pending / claimed" */}
          <span className="text-[11px] text-muted">{row.label}</span>

          {/* bar */}
          <div className="h-2.5 min-w-0 overflow-hidden rounded-full bg-rule">
            <div className="h-full rounded-full" style={{ width: `${row.r * 100}%`, background: row.bg }} />
          </div>

          {/* amount */}
          <span
            title={`${formatAmount(row.value, decimals, 18)} ${symbol}`}
            className="text-right font-mono text-[11px]"
          >
            {formatAmount(row.value, decimals)}
          </span>
        </Fragment>
      ))}

      <p className="col-span-3 pt-0.5 text-right font-mono text-[11px] text-muted">
        {formatAmount(flow.allTime, decimals)} {symbol} all time
      </p>
    </div>
  )
}
