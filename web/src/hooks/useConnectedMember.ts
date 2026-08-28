'use client'

import { useAccount, useChainId } from "wagmi"
import { useMounted } from "./useMounted"
import { EXPECTED_CHAIN } from "@/lib/chain/config"
import type { Member } from "@/lib/chain/types"

export function useConnectedMember(members?: Member[]) {
  const mounted = useMounted();
  const { address } = useAccount();
  const chainId = useChainId();

  const isReady = mounted && Boolean(address) && chainId === EXPECTED_CHAIN.id

  //checking if the current connected account is a member of members
  const member = isReady
    ? members?.find((m) => m.address.toLowerCase() === address!.toLowerCase())
    : undefined

  return {
    address: isReady ? address : undefined,
    member,
    isMember: Boolean(member),
    canAct: isReady
  }
}
