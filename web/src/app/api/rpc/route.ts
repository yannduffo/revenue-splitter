import { NextResponse } from "next/server";

const UPSTREAM = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`

// Infura free tier: 500 credits/s. eth_getLogs costs 255, so barely 2 per second.
const CREDITS: Record<string, number> = { eth_getLogs: 255, eth_chainId: 5 }
const DEFAULT_CREDITS = 80
const BUDGET_PER_SEC = 400      // margin under the 500 cap
const RETRIES = 3
const RETRY_BASE_MS = 800
const CONFIRMATIONS = 64n       // don't cache a window that could still reorg
const CACHE_MAX = 2000

type Call = { jsonrpc?: string; id?: unknown; method?: string; params?: unknown[] }
type Resp = { jsonrpc?: string; id?: unknown; result?: unknown; error?: unknown }

// closed getLogs windows are immutable: cache shared by every visitor
const logsCache = new Map<string, unknown>()
let head = 0n                   // highest block seen flowing through this proxy

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const cost = (c: Call) => CREDITS[c.method ?? ''] ?? DEFAULT_CREDITS

//TODO: swap for an indexer, this proxy is only buying time
function cacheKey(call: Call): string | undefined {
  if (call.method !== 'eth_getLogs') return undefined
  const f = call.params?.[0] as Record<string, unknown> | undefined
  if (!f) return undefined

  const from = f.fromBlock, to = f.toBlock
  //rejects "latest" and friends: only concrete block numbers are cacheable
  if (typeof from !== 'string' || typeof to !== 'string') return undefined
  if (!from.startsWith('0x') || !to.startsWith('0x')) return undefined
  if (head === 0n || BigInt(to) > head - CONFIRMATIONS) return undefined

  return JSON.stringify([f.address ?? null, f.topics ?? null, from, to])
}

function remember(key: string, value: unknown) {
  if (logsCache.size >= CACHE_MAX) logsCache.delete(logsCache.keys().next().value!)
  logsCache.set(key, value)
}

// token bucket, serialized: every upstream call waits its turn
let gate: Promise<unknown> = Promise.resolve()
let windowStart = 0
let spent = 0

function throttle<T>(credits: number, fn: () => Promise<T>): Promise<T> {
  const run = gate.then(async () => {
    const now = Date.now()
    if (now - windowStart >= 1000) { windowStart = now; spent = 0 }
    if (spent + credits > BUDGET_PER_SEC) {
      await sleep(Math.max(0, 1000 - (Date.now() - windowStart)))
      windowStart = Date.now(); spent = 0
    }
    spent += credits
    return fn()
  })
  gate = run.catch(() => {})
  return run
}

const isRateLimited = (status: number, text: string) =>
  status === 429 || text.includes('-32005')

async function callUpstream(body: string, credits: number) {
  for (let attempt = 0; ; attempt++) {
    const res = await throttle(credits, () =>
      fetch(UPSTREAM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    )
    const text = await res.text()
    if (!isRateLimited(res.status, text) || attempt >= RETRIES) {
      return { status: res.status, text }
    }
    await sleep(RETRY_BASE_MS * 2 ** attempt)
  }
}

export async function POST(request: Request) {
  if (!process.env.INFURA_API_KEY) {
    return NextResponse.json({error: 'RPC not configured'}, {status: 500})
  }

  const raw = await request.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    //not our business to validate: forward as-is
    const { status, text } = await callUpstream(raw, DEFAULT_CREDITS)
    return new NextResponse(text, { status, headers: {'Content-Type': 'application/json'} })
  }

  const batched = Array.isArray(parsed)
  const calls = (batched ? parsed : [parsed]) as Call[]

  // split cache hits from what really needs Infura
  const hits = new Map<number, unknown>()
  const missIdx: number[] = []
  for (let i = 0; i < calls.length; i++) {
    const key = cacheKey(calls[i])
    const cached = key ? logsCache.get(key) : undefined
    if (cached !== undefined) hits.set(i, { jsonrpc: '2.0', id: calls[i].id, result: cached })
    else missIdx.push(i)
  }

  let fresh: Resp[] = []
  let status = 200

  if (missIdx.length) {
    const payload = missIdx.map((i) => calls[i])
    const credits = payload.reduce((sum, c) => sum + cost(c), 0)
    const up = await callUpstream(
      JSON.stringify(batched ? payload : payload[0]), credits,
    )
    status = up.status

    try {
      const body: Resp | Resp[] = JSON.parse(up.text)
      fresh = Array.isArray(body) ? body : [body]
    } catch {
      return new NextResponse(up.text, { status, headers: {'Content-Type': 'application/json'} })
    }

    // learn the head, then store what is safely immutable
    for (let k = 0; k < payload.length; k++) {
      const r = fresh[k]
      if (!r || r.error !== undefined || r.result === undefined) continue

      if (payload[k].method === 'eth_blockNumber' && typeof r.result === 'string') {
        const seen = BigInt(r.result)
        if (seen > head) head = seen
      }

      const key = cacheKey(payload[k])
      if (key) remember(key, r.result)
    }
  }

  if (!hits.size) {
    return new NextResponse(
      JSON.stringify(batched ? fresh : fresh[0]),
      { status, headers: {'Content-Type': 'application/json'} },
    )
  }

  // rebuild the original order
  const merged: unknown[] = []
  let k = 0
  for (let i = 0; i < calls.length; i++) {
    merged.push(hits.has(i) ? hits.get(i) : fresh[k++])
  }

  return new NextResponse(
    JSON.stringify(batched ? merged : merged[0]),
    { status, headers: {'Content-Type': 'application/json'} },
  )
}
