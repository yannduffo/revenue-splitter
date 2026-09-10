"use client";

import { Fragment, useEffect, useState } from "react";
import type { Member, MemberBalance, SplitterToken } from "@/lib/chain/types";
import type { MemberTokenRow } from "@/lib/chain/balance";
import type { Address } from "viem";
import { shareTone } from "@/lib/format";
import { MemberCard } from "./MemberCard";
import { MemberDetailPanel } from "./MemberDetailPanel";

const COLS = 3;
const PANEL_MS = 300;

export function MemberGrid({
  splitter, members, balances, token, openMember, onToggle, detail, isLoadingDetail, connectedAddress, canAct
}: {
  splitter: Address
  members: Member[]
  balances?: MemberBalance[]
  token: SplitterToken
  openMember?: Address
  onToggle: (member?: Address) => void
  detail?: MemberTokenRow[]
  isLoadingDetail?: boolean
  connectedAddress?: Address
  canAct:boolean
  }) {
  const [active, setActive] = useState(openMember)

  if (openMember && openMember !== active) setActive(openMember)

  // closing must be delay for unmount time
  useEffect(() => {
    if (openMember || !active) return
    const timer = setTimeout(() => setActive(undefined), PANEL_MS)
    return () => clearTimeout(timer)
  }, [openMember, active])

  const activeIndex = members.findIndex(
    (m) => m.address.toLowerCase() === active?.toLowerCase(),
  )

  // where to insert the detailPanel
  const panelAfter = activeIndex >= 0
    ? Math.min((Math.floor(activeIndex / COLS) + 1) * COLS - 1, members.length - 1)
    : -1

  return (
    <div className="grid gap-3 grid-cols-3">
      {members.map((member, i) => {
        const isOpen = member.address.toLowerCase() === openMember?.toLowerCase()
        return (
          <Fragment key={member.address}>
            <MemberCard
              member={member}
              index={i}
              total={members.length}
              balance={balances?.find(
                (b) => b.member.toLowerCase() === member.address.toLowerCase(),
              )}
              token={token}
              isOpen={isOpen}
              onToggle={() => onToggle(isOpen ? undefined : member.address)}
              isConnected = {connectedAddress?.toLowerCase() === member.address.toLowerCase()}
            />

            {i === panelAfter && (
              <MemberDetailPanel
                key={members[activeIndex].address}
                splitter={splitter}
                account={members[activeIndex].address}
                shareBps={members[activeIndex].shareBps}
                tone={shareTone(activeIndex, members.length).bg}
                isOpen={Boolean(openMember)}
                detail={detail}
                isLoading={isLoadingDetail}
                isConnected={
                  connectedAddress?.toLowerCase() ===
                  members[activeIndex].address.toLowerCase()
                }
                canAct={canAct}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
