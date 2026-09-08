'use client'

import { shareTone } from '@/lib/format'
import { fromBps, toBps, type MemberRowState } from '@/lib/create'

export function ShareSummary({
  rows, totalBps,
}: {
  rows: MemberRowState[]
  totalBps: number
}) {
  const remaining = 10_000 - totalBps
  const segments = rows
    .map((row, i) => ({ bps: toBps(row.share) ?? 0, i }))
    .filter((s) => s.bps > 0)

  return (
    <div className="flex flex-col gap-2 border-t border-rule px-3 py-3">
      <p className='text-[11px] uppercase tracking-wide text-muted'>Shares allocation summary</p>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-paper">
        {segments.map((segment) => (
          <div
            key={segment.i}
            style={{
              width: `${Math.min(segment.bps, 10_000) / 100}%`,
              background: shareTone(segment.i, rows.length).bg,
            }}
          />
        ))}
      </div>

      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted">
          {rows.length} member{rows.length > 1 ? 's' : ''}
        </span>
        <span className="font-mono">
          {fromBps(totalBps)}% allocated
          {remaining !== 0 && (
            <span className="ml-2 text-muted">
              {remaining > 0
                ? `| ${fromBps(remaining)}% remaining`
                : `| ${fromBps(-remaining)}% over`}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
