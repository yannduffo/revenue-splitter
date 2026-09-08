import { getAddress, isAddress, type Address } from "viem";

export type MemberRowState = {
  id: string
  nickname: string
  address: string
  share: string //percentage = text
}

export type RowError = { address?: string, share?: string }

export type Validation = {
  rowErrors: RowError[] //error on a designated row level
  globalError?: string //error on the splitter conf level
  totalBps: number
  isValid: boolean
  payload?: { members: Address[], shares: bigint[] }
}

export function toBps(share: string): number | undefined {
  const trimmed = share.trim()
  if (trimmed === '') return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || parsed < 0) return undefined
  return Math.round(parsed * 100) // % * 100 -> 10_000
}

//2 decimals, printed whenever needed
export function fromBps(bps: number): string {
  return (bps / 100).toFixed(2).replace(/\.?0+$/, '')
}


export function distributeEvenly(count: number): number[] {
  const base = Math.floor(10_000 / count)
  const remainder = 10_000 - base * count //remainder will be added 1 by 1 one share and the followings until = 0
  return Array.from({length: count}, (_, i) => base + (i < remainder ? 1 : 0))
}

//the front-end should verify every condition verified in the contract so an invalid call which would revert doesn't even happen
export function validate(rows: MemberRowState[]): Validation {
  const rowErrors: RowError[] = rows.map(() => ({}))
  let globalError: string | undefined
  let totalBps = 0

  const seen = new Map<string, number>()

  rows.forEach((row, i) => {
    //checking addresses validity :
    const address = row.address.trim()

    if (address === '') {
      rowErrors[i].address = 'Member address is required'
    } else if (!isAddress(address)) {
      rowErrors[i].address = 'Invalid address format'
    } else if (BigInt(address) === 0n) {
      rowErrors[i].address = 'Zero address is not a valid entry'
    } else {
      const key = address.toLowerCase()
      if (seen.has(key)) {
        rowErrors[i].address = 'This address is duplicated'
        globalError ??= 'The same address appears twice'
      }
      seen.set(key, i)
    }

    //checking bps validity
    const bps = toBps(row.share)
    if (bps === undefined) {
      rowErrors[i].share = 'Invalid shares allocated value'
    } else if (bps === 0) {
      rowErrors[i].share = 'Shares allocated must be above 0'
    } else {
      totalBps += bps
    }
  })

  //cheking members number
  if (rows.length === 0) globalError ??= 'Add at least one member'
  if (rows.length > 50) globalError ??= 'A splitter can hold at most 50 members'

  const hasRowError = rowErrors.some((e) => e.address || e.share)

  //checking if total = 10_000
  if (!hasRowError && totalBps !== 10_000) {
    globalError = 'Share must add up to exactly 100%'
  }

  //global red/green light
  const isValid = !hasRowError && !globalError

  return {
    rowErrors,
    globalError,
    totalBps,
    isValid,
    payload: isValid
      ? {
          members: rows.map((r) => getAddress(r.address.trim())),
          shares: rows.map((r) => BigInt(toBps(r.share)!)),
        }
      : undefined,
  }
}
