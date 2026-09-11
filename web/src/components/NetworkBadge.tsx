'use client'

import { Info } from "lucide-react"
import { EXPECTED_CHAIN } from "@/lib/chain/config"

export function NetworkBadge() {
  const isTestnet = EXPECTED_CHAIN.testnet === true
  const label = isTestnet ? "testnet" : "local"
  const detail = isTestnet
    ? `This app runs on the ${EXPECTED_CHAIN.name} test network. Tokens here have no real value.`
    : `This app runs on a local ${EXPECTED_CHAIN.name} node.`

  return (
    <span
      title={detail}
      className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-600"
    >
      <Info size={16} aria-hidden="true" />
      Live on {' '}
      {EXPECTED_CHAIN.name} {label}
    </span>
  )
}
