import { formatUnits, type Address } from 'viem'

//return printable short address
export function shortenAddress(address: Address, chars = 4): string {
  return `${address.slice(0,2 + chars)}...${address.slice(-chars)}`
}

// formating 10_000 in percentage
export function formatBps(bps: number): string {
  return `${(bps/100).toFixed(2).replace(/\.?0+$/, '')}%`
}

//give "pritable number" base on real bigint values
export function formatAmount(value: bigint, decimals: number, maxFractionDigits = 4): string {
  const [whole, fraction = ''] = formatUnits(value, decimals).split('.')
  const kept = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  const grouped = BigInt(whole).toLocaleString('en-US')
  return kept ? `${grouped}.${kept}` : grouped
}

//generate color for each member share percentage
export function shareTone(index: number, total: number): { bg: string; fg: string } {
  const t = total <= 1 ? 0 : index / (total - 1)
  const lightness = 28 + (76 - 28) * t
  return {
    bg: `hsl(163 27% ${lightness.toFixed(1)}%)`,
    fg: lightness > 55 ? '#16233A' : "#F4F6F5",
  }
}
