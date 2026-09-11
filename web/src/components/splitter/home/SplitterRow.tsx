'use client'

import Link from "next/link"
import { shareTone} from "@/lib/format"
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
        <span className="truncate font-mono text-sm group-hover:text-accent">
          {/*TODO passer en shortenAddress(splitter.address, 6) lorsque la fenêtre réduit en largeur*/}
          {splitter.address}
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
