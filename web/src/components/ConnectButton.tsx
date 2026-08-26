'use client'

import { useAccount, useConnect, useDisconnect } from "wagmi"

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button onClick={() => disconnect()} className="font-mono text-sm">
        {address.slice(0,6)}...{address.slice(-4)}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((c) => (
        <button key={c.id} onClick={() => connect({ connector: c })} disabled={isPending}>
          {c.name}
        </button>
      ))}
    </div>
  )
}
