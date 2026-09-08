import type { Address } from "viem";
import { config } from "@/lib/wagmi";

//TODO tranche 3 : remplacer par la découverte via les logs sur Transfer
export const DEV_TOKENS = (process.env.NEXT_PUBLIC_DEV_TOKENS ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean) as Address[]

export const EXPECTED_CHAIN = config.chains[0]

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`

// bound getLogs with a block heigth to start looking for events
// kind of useless on anvil but essential on sepolia
export const FACTORY_BLOCK = BigInt(process.env.NEXT_PUBLIC_FACTORY_BLOCK ?? '0')
