import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { foundry } from "viem/chains";
import { injected } from "wagmi";

//internaly used by wagmi to configure it's viem client
export const config = createConfig({
  chains: [foundry],
  connectors: [injected()], //injected wallets (Metamask, ...)
  transports: {
    [foundry.id]: http('http://127.0.0.1:8545'),
  },
  ssr: true,
  storage: createStorage({storage : cookieStorage}),
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
