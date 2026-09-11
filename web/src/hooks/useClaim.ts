"use client";

import { useSimulateContract } from "wagmi";
import type { Address } from "viem";
import { splitterAbi } from "@/lib/generated";
import { useTx } from "./useTx";
import { parseTxError } from "@/lib/errors";

const KEYS = ["token-balances", "member-detail", "splitter-tokens", "history"];

export function useClaim({
  splitter,
  token,
  account,
  enabled = true,
}: {
  splitter?: Address;
  token?: Address;
  account?: Address;
  enabled?: boolean;
  }) {
  //1. doing the tx simulation
  const simulation = useSimulateContract({
    address: splitter,
    abi: splitterAbi,
    functionName: 'claim',
    args: token ? [token] : undefined,
    account,
    query: {enabled : Boolean(enabled && splitter && token && account)},
  })

  //2. preparation + send of the claim using useTx hook
  const tx = useTx({ invalidateKeys: KEYS })

  const claim = async () => {
    if (!simulation.data?.request) return
    await tx.send(simulation.data.request)
  }

  const simulationError = simulation.error ? parseTxError(simulation.error) : undefined

  return {
    claim,
    status: tx.status,
    reset: tx.reset,
    isReady: Boolean(simulation.data?.request), //"isReady" will enable or disabled the claim button
    isSimulating: simulation.isLoading,
    simulationError,
  }

}
