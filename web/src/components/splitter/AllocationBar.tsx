import { ExternalLink } from "lucide-react";
import type { Member } from "@/lib/chain/types";
import { formatBps, shareTone, shortenAddress } from "@/lib/format";
import { explorerUrl } from "@/lib/chain/config";

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

      {/* format square gap shartenAddress + explorer link */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {members.map((member, i) => {
          //undefined sur anvil : pas d'explorateur, on rend alors une entree non cliquable
          const url = explorerUrl('address', member.address)

          const content = (
            <>
              <span
                className="size-4 shrink-0 rounded"
                style={{ backgroundColor: shareTone(i, members.length).bg }}
              />
              {shortenAddress(member.address)}
              {url && <ExternalLink size={12} />}
            </>
          )

          return url ? (
            <a
              key={member.address}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {content}
            </a>
          ) : (
            <div
              key={member.address}
              className="flex items-center gap-2 font-mono text-xs text-muted"
            >
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
