"use client";

import { useSimulateContract } from "wagmi";
import { parseEventLogs, type Address } from "viem";
import { splitterFactoryAbi } from "@/lib/generated";
import { FACTORY_ADDRESS } from "@/lib/chain/config";
import { useTx } from "./useTx";
import { parseTxError } from "@/lib/errors";

const KEYS = ["splitters"];

export function useCreateSplitter({
  payload,
  account,
}: {
  payload?: { members: Address[]; shares: bigint[] };
  account?: Address;
  }) {
  //simulation contract call
  const simulation = useSimulateContract({
    address: FACTORY_ADDRESS,
    abi: splitterFactoryAbi,
    functionName: 'createSplitter',
    args: payload ? [payload.members, payload.shares] : undefined,
    account,
    query: {enabled: Boolean(payload && account)},
  })

  const tx = useTx({ invalidateKeys: KEYS })

  const create = async (): Promise<Address | undefined> => {
    //return undefined if simulaiton "failed"
    if (!simulation.data?.request) return undefined

    //else make the "true" call
    const receipt = await tx.send(simulation.data.request)
    if (!receipt || receipt.status === 'reverted') return undefined

    //extracting event from logs
    const [created] = parseEventLogs({
      abi: splitterFactoryAbi,
      eventName: 'SplitterCreated',
      logs: receipt.logs
    })

    //returning splitter address
    return created?.args.splitter
  }

  return {
    create,
    status: tx.status,
    reset: tx.reset,
    isReady: Boolean(simulation.data?.request),
    isSimulating: simulation.isLoading,
    simulationError: simulation.error ? parseTxError(simulation.error) : undefined
  }
}
