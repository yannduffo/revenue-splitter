import type { Address } from "viem";
import { TARGET_CHAIN } from "@/lib//wagmi";

//getting selected chain
export const EXPECTED_CHAIN = TARGET_CHAIN

type Deployment = {
  factory: Address,
  factoryBlock: bigint,
  demoSplitter?: Address,
}

//creating both anvil and sepolia set of constants
const DEPLOYMENTS: Record<number, Deployment> = {
  31337: {
    factory: process.env.NEXT_PUBLIC_ANVIL_FACTORY as Address,
    factoryBlock: BigInt(process.env.NEXT_PUBLIC_ANVIL_FACTORY_BLOCK ?? '0'),
  },
  11155111: {
    factory: process.env.NEXT_PUBLIC_SEPOLIA_FACTORY as Address,
    factoryBlock: BigInt(process.env.NEXT_PUBLIC_SEPOLIA_FACTORY_BLOCK ?? '0'),
    demoSplitter: process.env.NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER as Address | undefined,
  }
}

//exporting the one actually used regarding the selected chain
export const DEPLOYMENT = DEPLOYMENTS[EXPECTED_CHAIN.id]

export const FACTORY_ADDRESS = DEPLOYMENT.factory
export const FACTORY_BLOCK = DEPLOYMENT.factoryBlock
export const DEMO_SPLITTER = DEPLOYMENT.demoSplitter

// function used to create explorer links on "everything" (contract, tx)
// will return undefined on anvil as there is no explorer
export function explorerUrl(kind: 'address' | 'tx', value: string): string | undefined {
  const base = EXPECTED_CHAIN.blockExplorers?.default.url
  return base ? `${base}/${kind}/${value}` : undefined
}

/* Legacy : DEV_TOKENS import before automatic discovering via logs
export const DEV_TOKENS = (process.env.NEXT_PUBLIC_DEV_TOKENS ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean) as Address[]

*/
