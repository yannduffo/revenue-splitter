import type { Address } from "viem";
import { TARGET_CHAIN } from "@/lib//wagmi";

//getting selected chain
export const EXPECTED_CHAIN = TARGET_CHAIN

type Deployment = {
  factory: Address,
  factoryBlock: bigint,
  demoSplitterA?: Address,
  demoSplitterB?: Address,
  demoTokens?: Address[],
}

//parse env demo splitter addresses list (separeted by a ",")
const parseAddressList = (raw?: string): Address[] =>
  (raw ?? '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean) as Address[]

//creating both anvil and sepolia set of constants
const DEPLOYMENTS: Record<number, Deployment> = {
  31337: {
    factory: process.env.NEXT_PUBLIC_ANVIL_FACTORY as Address,
    factoryBlock: BigInt(process.env.NEXT_PUBLIC_ANVIL_FACTORY_BLOCK ?? '0'),
  },
  11155111: {
    factory: process.env.NEXT_PUBLIC_SEPOLIA_FACTORY as Address,
    factoryBlock: BigInt(process.env.NEXT_PUBLIC_SEPOLIA_FACTORY_BLOCK ?? '0'),
    demoSplitterA: process.env.NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER_A as Address | undefined,
    demoSplitterB: process.env.NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER_B as Address | undefined,
    demoTokens: parseAddressList(process.env.NEXT_PUBLIC_SEPOLIA_DEMO_TOKENS),
  }
}

//exporting the one actually used regarding the selected chain
export const DEPLOYMENT = DEPLOYMENTS[EXPECTED_CHAIN.id]

export const FACTORY_ADDRESS = DEPLOYMENT.factory
export const FACTORY_BLOCK = DEPLOYMENT.factoryBlock
export const DEMO_SPLITTER_A = DEPLOYMENT.demoSplitterA
export const DEMO_SPLITTER_B = DEPLOYMENT.demoSplitterB
export const DEMO_TOKENS = DEPLOYMENT.demoTokens ?? []

export const DEMO_SPLITTERS = [DEMO_SPLITTER_A, DEMO_SPLITTER_B].filter(
  Boolean,
) as Address[]

//in lower case
const DEMO_SET = new Set(DEMO_SPLITTERS.map((a) => a.toLowerCase()))

export function isDemoSplitter(address?: string): boolean {
  return Boolean(address && DEMO_SET.has(address.toLowerCase()))
}

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
