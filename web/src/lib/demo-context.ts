import { isAddress, type Address } from 'viem'
import { DEMO_SPLITTER_A, DEMO_SPLITTER_B } from '@/lib/chain/config'
import type { DemoContext } from '@/lib/demo-content'

const eq = (a?: string, b?: string) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase())

//aim : print the correct information regarding where the user is currently navigating
export function resolveDemoContext(pathname: string): {
  context: DemoContext
  splitter?: Address
} {
  const match = pathname.match(/^\/s\/([^/]+)/)
  const raw = match?.[1]

  if (!raw || !isAddress(raw)) return { context: 'home' }

  const splitter = raw as Address
  if (eq(splitter, DEMO_SPLITTER_A)) return { context: 'splitterA', splitter }
  if (eq(splitter, DEMO_SPLITTER_B)) return { context: 'splitterB', splitter }
  return { context: 'otherSplitter', splitter }
}
