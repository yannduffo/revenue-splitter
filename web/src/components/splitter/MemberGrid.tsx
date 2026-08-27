import type { Member, MemberBalance, SplitterToken } from "@/lib/chain/types";
import { formatAmount, formatBps, shareTone, shortenAddress } from "@/lib/format";

export function MemberGrid({
  members, balances, token, selected, onSelect,
}: {
    members: Member[],
    balances?: MemberBalance[],
    token: SplitterToken,
    selected?: string,
    onSelect: (member:string) => void
  }) {
    return (
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          {members.map((member, i) => {
            const balance = balances?.find(
              (b) => b.member.toLowerCase() === member.address.toLowerCase(),
            )
            const isSelected = selected?.toLowerCase() === member.address.toLowerCase()

            return (
              <button
                key={member.address}
                onClick={() => onSelect(member.address)}
                className={`rounded-xl border-t-2 bg-surface p-3 text-left ${
                  isSelected ? 'border-x border-b border-x-accent border-b-accent' : 'border-x border-b border-x-rule border-b-rule'
                }`}
                style={{ borderTopColor: shareTone(i, members.length).bg }}
              >
                <div className="flex justify-between">
                  <p className="font-mono text-xs text-muted">{shortenAddress(member.address)}</p>
                  <p className="text-xs text-muted">{formatBps(member.shareBps)}</p>
                </div>

                <p className="mt-3 text-[11px] uppercase tracking-wide text-muted">Pending</p>
                <p className="font-mono text-lg">
                  {balance ? formatAmount(balance.pending, token.decimals) : '—'} {token.symbol}
                </p>

                <p className="mt-2 text-[11px] uppercase tracking-wide text-muted">Claimed</p>
                <p className="font-mono text-sm text-muted">
                  {balance ? formatAmount(balance.claimed, token.decimals) : '—'} {token.symbol}
                </p>
              </button>
            )
          })}
        </div>
      )
}
