import type { Member, MemberBalance, SplitterToken } from "@/lib/chain/types";
import type { MemberTokenRow } from "@/lib/chain/balance";
import type { Address } from "viem";
import { MemberCard } from "./MemberCard";

export function MemberGrid({
  members, balances, token, openMember, onToggle, detail, isLoadingDetail,
}: {
  members: Member[]
  balances?: MemberBalance[]
  token: SplitterToken
  openMember?: Address
  onToggle: (member?: Address) => void
  detail?: MemberTokenRow[]
  isLoadingDetail?: boolean
}) {
  return (
    <div className="grid gap-3 grid-cols-3">
      {members.map((member, i) => {
        const isOpen = openMember?.toLowerCase() === member.address.toLowerCase()
        return (
          <MemberCard
            key={member.address}
            member={member}
            index={i}
            total={members.length}
            balance={balances?.find(
              (b) => b.member.toLowerCase() === member.address.toLowerCase(),
            )}
            token={token}
            isOpen={isOpen}
            onToggle={() => onToggle(isOpen ? undefined : member.address)}
            detail={isOpen ? detail : undefined}
            isLoadingDetail={isOpen && isLoadingDetail}
          />
        )
      })}
    </div>
  )
}
