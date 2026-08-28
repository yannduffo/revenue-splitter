import type { Address } from "viem";
import { config } from "@/lib/wagmi";

//TODO tranche 3 : remplacer par la découverte via les logs sur Transfer
export const DEV_TOKENS = (process.env.NEXT_PUBLIC_DEV_TOKENS ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean) as Address[]

export const EXPECTED_CHAIN = config.chains[0]
