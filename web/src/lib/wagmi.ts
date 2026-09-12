import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { foundry, sepolia } from "viem/chains";
import { injected } from "wagmi";

export const TARGET_CHAIN = process.env.NEXT_PUBLIC_CHAIN === 'anvil' ? foundry : sepolia

// we are keeping both anvil and sepolia config to be able to continue the
// dApp development easily
export const config = createConfig({
  chains: TARGET_CHAIN === foundry ? [foundry, sepolia] : [sepolia, foundry],
  connectors: [injected()], //TODO: add walletConnect for mobile users (low priority)
  transports: {
    [sepolia.id]: http('/api/rpc', {batch: true}), //viem tries multicall3 when its possible
    [foundry.id]: http('http://127.0.0.1:8545', {batch: true}),
  },
  //sepolia produces a block every ~12s; viem's default caps at 4s, so 2 polls out of 3 are wasted
  pollingInterval: 12_000,
  ssr: true,
  storage: createStorage({storage: cookieStorage})
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
