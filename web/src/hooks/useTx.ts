"use client";

import { useCallback, useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import type { Hash } from "viem";

import { parseTxError, type TxError } from "@/lib/errors";

//main "state machine" to follow a tx status
export type TxStatus =
  | { state: "idle" }
  | { state: "awaitingSignature" }
  | { state: "confirming"; hash: Hash }
  | { state: "success"; hash: Hash }
  | { state: "reverted"; hash: Hash }
  | { state: "error"; error: TxError };

export function useTx({
  invalidateKeys = [],
}: { invalidateKeys?: string[] } = {}) {
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<TxStatus>({ state: "idle" });

  // generic transaction lifecycle: wallet signature → on-chain confirmation → receipt.
  const send = useCallback(
    async (request: unknown) => {
      setStatus({ state: "awaitingSignature" });
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hash = await writeContractAsync(request as any); //we are using async writeContract to encapsulate it on a try/catch
        setStatus({ state: "confirming", hash: hash });

        const receipt = await publicClient.waitForTransactionReceipt({hash})

        if (receipt.status === 'reverted') {
          setStatus({ state: 'reverted', hash })
          return receipt
        }

        setStatus({ state: 'success', hash });

        // refresh blockchain queries only after the transaction is confirmed
        await Promise.all(
          invalidateKeys.map((key) =>
            queryClient.invalidateQueries({
              queryKey: [key],
            }),
          )
        )

        //printing "Done" for 3 secs before "claim" comes back
        setTimeout(() => {
          setStatus((current) => current.state === 'success' && current.hash === hash ? {state: 'idle'} : current)
        }, 3000)

        return receipt

      } catch (error) {
        // error state if writeContract call fail
        const parsed = parseTxError(error)
        setStatus(parsed.kind === 'rejected' ? {state: 'idle'} : { state: 'error', error: parsed});
        return undefined;
      }
    },
    [publicClient, writeContractAsync, invalidateKeys, queryClient],
  );

  const reset = useCallback(() => {
    setStatus({ state: 'idle' })
  }, [])

  return {status, send, reset}
}
