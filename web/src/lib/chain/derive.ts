import { ratio } from '@/lib/format'

export type MemberFlow = {
  allTime: bigint
  pendingRatio: number
  claimedRatio: number
  isEmpty: boolean
}

export function deriveMemberFlow(input: { pending: bigint; claimed: bigint }): MemberFlow {
  const allTime = input.pending + input.claimed

  if (allTime === 0n) {
    return { allTime, pendingRatio: 0, claimedRatio: 0, isEmpty: true }
  }

  return {
    allTime,
    pendingRatio: ratio(input.pending, allTime),
    claimedRatio: ratio(input.claimed, allTime),
    isEmpty: false,
  }
}
