import { NextResponse } from "next/server";

const UPSTREAM = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`

// Infura free tier: 500 credits/s. eth_getLogs costs 255, so barely 2 per second.
const CREDITS: Record<string, number> = { eth_getLogs: 255, eth_chainId: 5 }
const DEFAULT_CREDITS = 80
const BUDGET_PER_SEC = 400      // margin under the 500 cap
const RETRIES = 3
const RETRY_BASE_MS = 800

type Call = { method?: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const cost = (c: Call) => CREDITS[c.method ?? ''] ?? DEFAULT_CREDITS

//credits of a whole payload : viem batches serval JSON-RPC calls in one request
function payloadCost(raw: string): number{
  try {
    const parsed = JSON.parse(raw) as Call | Call[]
    const calls = Array.isArray(parsed) ? parsed : [parsed]
    return calls.reduce((sum, c) => sum + cost(c), 0)
  }
  catch {
    return DEFAULT_CREDITS
  }
}

//token bucket, serialized: every upstream call waits its turn
let gate: Promise<unknown> = Promise.resolve();
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

const isRateLimited = (status: number, text: string) => status === 429 || text.includes('-32005')

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
  const { status, text } = await callUpstream(raw, payloadCost(raw))

  return new NextResponse(text, { status, headers: {'Content-Type': 'application/json'} })
}
