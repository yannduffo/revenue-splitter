'use client'

import Link from "next/link"
import { shareTone, shortenAddress } from "@/lib/format"
import type { Splitter } from "@/lib/chain/types"
import type { SplitterRole } from "@/hooks/useSplitters"
import { isDemoSplitter } from "@/lib/chain/config"
import { DemoBadge } from "../DemoBadge"

export function SplitterRow({ splitter, role }: { splitter: Splitter; role: SplitterRole }) {
  return (
    <Link
      href={`/s/${splitter.address}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-2 border-b border-rule px-4 py-3 transition-colors last:border-0 hover:bg-paper sm:grid-cols-[minmax(0,1fr)_240px_100px]"
    >
      {/* shortAddr + connected user role */}
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-mono text-sm group-hover:text-accent">
          {/* tail truncation would hide the end of the address, which is half of
              what people check : shorten keeps both ends */}
          <span className="sm:hidden">{shortenAddress(splitter.address, 6)}</span>
          <span className="hidden truncate sm:inline">{splitter.address}</span>
        </span>
        {isDemoSplitter(splitter.address) && <DemoBadge />}
        {role !== 'none' && (
          <span className="shrink-0 rounded border border-rule px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {role === 'creator' ? 'creator' : 'member'}
          </span>
        )}
      </div>

      {/* share distribution bar */}
      <div className="hidden h-1.5 overflow-hidden rounded-full sm:flex">
        {splitter.members.map((member, i) => (
          <div
            key={member.address}
            style={{
              width: `${member.shareBps / 100}%`,
              background: shareTone(i, splitter.members.length).bg,
            }}
          />
        ))}
      </div>

      {/* number of members */}
      <span className="text-right text-xs text-muted">
        {splitter.members.length} members
      </span>
    </Link>
  )
}
