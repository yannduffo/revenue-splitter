'use client'

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { useMounted } from "@/hooks/useMounted";
import { EXPECTED_CHAIN } from "@/lib/chain/config";
import { shortenAddress } from "@/lib/format";

export function ConnectButton() {
  const mounted = useMounted()
  const { address, isConnected } = useAccount();
  const { connectors, mutate: connect, isPending: isConnecting } = useConnect();
  const { mutate: disconnect } = useDisconnect();
  const chainId = useChainId()
  const { mutate: switchChain, isPending: isSwitching } = useSwitchChain(); //en wagmi v3 useSwitchChain expose mes état standard d'une TanStack Query

  //to ensure connectedState matching between server and browser
  if (!mounted) {
    return <div className="h-9 w-32 rounded-lg bg-paper" aria-hidden />
  }

  if (!isConnected) {
    const injectedConnector = connectors.find((c) => c.type === 'injected') //get existing wallet in browser
    return (
      <button
        onClick={() => injectedConnector && connect({ connector: injectedConnector })}
        disabled={isConnecting || !injectedConnector}
        className="rounded-lg border border-rule bg-surface px-3 py-1.5 text-sm hover:border-muted disabled:opacity-50"
      >
        {isConnecting ? 'Connecting…' : injectedConnector ? 'Connect wallet' : 'No wallet found'}
      </button>
    )
  }

  if (chainId !== EXPECTED_CHAIN.id) {
    return (
      <button
        onClick={() => switchChain({ chainId: EXPECTED_CHAIN.id })}
        disabled={isSwitching}
        className="rounded-lg bg-accent px-3 py-1.5 text-sm text-paper disabled:opacity-50"
      >
        {isSwitching ? 'Switching…' : `Switch to ${EXPECTED_CHAIN.name}`}
      </button>
    )
  }

  return (
    <button
      onClick={() => disconnect()}
      className="rounded-lg border border-rule bg-surface px-3 py-1.5 font-mono text-sm hover:border-muted"
      title="Disconnect"
    >
      {shortenAddress(address!, 4)}
    </button>
  )

}
