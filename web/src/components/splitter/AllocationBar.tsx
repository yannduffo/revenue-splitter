import type { Member } from "@/lib/chain/types";
import { formatBps, shareTone, shortenAddress } from "@/lib/format";

export function AllocationBar({ members }: { members: Member[] }) {
  return (
    <div>
      {/* percentage bar */}
      <div className="flex h-11 overflow-hidden rounded-lg">
        {members.map((member, i) => {
          const { bg, fg } = shareTone(i, members.length)
          return (
            <div
              key={member.address}
              className="flex items-center justify-center text-[13px]"
              style={{ width: `${member.shareBps / 100}%`, background: bg, color: fg }}
              title={`${member.address} — ${formatBps(member.shareBps)}`}
            >
              {member.shareBps >= 700 ? formatBps(member.shareBps) : null}
            </div>
          )
        })}
      </div>

      {/* format square gap shartenAddress */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {members.map((member, i) => (
          <div
            key={member.address}
            className="flex items-center gap-2 font-mono text-xs text-muted"
          >
            <span
              className="size-4 shrink-0 rounded"
              style={{ backgroundColor: shareTone(i, members.length).bg }}
            />
            {shortenAddress(member.address)}
          </div>
        ))}
      </div>
    </div>
  )
}
