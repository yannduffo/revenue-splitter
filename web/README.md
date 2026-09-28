# Revenue-splitter frontend

Next.js app for the Splittr revenue splitter. Reads contract state straight from
the chain, and everything derived from event logs from the indexer database,
through its own API routes.

Live: https://revenue-splitter.yannduffo.xyz

For what the product does and the contracts behind it, see the
[root README](../README.md).

---

## Running locally

Requires Node 20+, and Foundry if you want to regenerate the contract ABIs.

```bash
npm install
cp .env.example .env.local     # fill in the values below
npm run wagmi                  # generates src/lib/generated.ts from ../contracts/out
npm run dev
```

Lists and history come from the indexer: start it first (see [indexer](../indexer/README.md)), or pages will load with empty lists.

`npm run wagmi` reads the Foundry artifacts in `../contracts/out` and writes
typed ABIs. Re-run it after any contract change — that is what surfaces breakage
as TypeScript errors instead of runtime reverts. The generated file is committed,
so a deploy host does not need Foundry.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_CHAIN` | `sepolia` or `anvil` — which chain the app targets |
| `NEXT_PUBLIC_SITE_URL` | absolute URL, used as `metadataBase` for OG tags |
| `NEXT_PUBLIC_SEPOLIA_FACTORY` | factory address |
| `NEXT_PUBLIC_SEPOLIA_DEMO_SPLITTER_A/B` | demo splitters, used for the contextual help panel |
| `NEXT_PUBLIC_SEPOLIA_DEMO_TOKENS` | demo ERC-20s exposed in the faucet |
| `NEXT_PUBLIC_ANVIL_*` | same, for local development |
| `INFURA_API_KEY` | **server-side only**, never prefixed — read by the RPC proxy |
| `DATABASE_URL` | **server side only**: the indexer database, read by the API routes |

Switching between local and testnet is a matter of flipping
`NEXT_PUBLIC_CHAIN` and restarting the dev server. Both chains stay declared in
the wagmi config, so the chain guard keeps working either way.

### Against a local chain

```bash
cd ../contracts
anvil
make deploy-seed-anvil          # factory + two mock tokens + seeded splitters
```

Copy the printed factory address into `NEXT_PUBLIC_ANVIL_FACTORY`.

---

## Stack

- **Next.js 16** (App Router) — every page touching the wallet is a client component
- **viem**: RPC transport, ABI encoding
- **wagmi 3** — React bindings over viem
- **TanStack Query** — every chain read is a query, with caching and invalidation
- **postgres.js**: read access to the indexer database, from route handlers only
- **Tailwind v4** — no config file; theme tokens are declared in `globals.css`

No connect-wallet kit. See the decisions below.

---

## Architecture

```
src/
├─ app/
│  ├─ api/rpc/          RPC proxy — keeps the provider key server-side
│  ├─ api/splitters/    indexer API: route handlers reading Postgres
│  ├─ page.tsx          splitter list
│  ├─ create/           creation form
│  └─ s/[address]/      splitter detail
├─ lib/
│  ├─ chain/            data access layer — pure functions over a viem client
│  ├─ db.ts             Postgres pool, server only
│  ├─ generated.ts      wagmi CLI output, never edited by hand
│  ├─ errors.ts         custom errors → human messages
│  └─ format.ts         bigint, decimals, basis points
├─ hooks/               React Query wrappers around lib/chain
└─ components/
```

The important boundary is `lib/chain/`. Every function there takes a viem client
and returns plain domain objects — no React, no hooks, no query cache. Hooks wrap
them, components only ever see hooks.

That separation paid off: moving from direct log queries to the indexer rewrote
four files in `lib/chain/`. Hooks only lost a `fromBlock` parameter, and no
component changed.

---

## Technical decisions

### Indexed reads, live state

Anything derived from event logs comes from `/api/splitters/*`, route handlers that query the indexer database. Anything that is contract state (`pending`, balances, `isOfficialSplitter`) stays a live view call. Bigints travel as strings in JSON and are converted back in `lib/chain/`.

The database pool is created on first use, not at import: `next build` imports every route, and `DATABASE_URL` only exists at runtime.

### Token discovery by recipient

A splitter has no on-chain list of the tokens it holds — by design, the contract
never iterates over tokens. Discovery therefore queries ERC-20 `Transfer` logs
filtered on the indexed recipient topic, **with no contract address filter**:
every token ever sent to a given splitter, without declaring anything upfront.

This is an unusual query shape: generic indexers watch contracts, not recipients.
It is the reason this project runs its own indexer, detailed in
[indexer/NOTES.md](../indexer/NOTES.md).

### No connect-wallet kit

RainbowKit, ConnectKit and AppKit all pin to a wagmi major and lag it by months.
Taking one would have meant staying a version behind on the core library, for a
connection flow that fits in forty lines. `ConnectButton` handles it directly
with the `injected` connector.

The trade-off: no WalletConnect, so mobile browsers are read-only. Adding it is
one connector and a project id.

### RPC proxy

The client talks to `/api/rpc`, a route handler that forwards to Infura with the
key held server-side. Nothing provider-specific reaches the browser, and the key
never enters the bundle.

### Chain guard

`useConnectedMember` gates every write behind three conditions: mounted,
connected, and on the expected chain. One subtlety worth recording — `useChainId()`
returns wagmi's internal chain, which silently stays on the configured default
when the wallet sits on an unlisted network. `useAccount().chainId` is what
actually reflects the wallet, and it is what the guard uses.

### Official splitter check

A `Splitter` is an ordinary contract. Anyone can deploy a look-alike exposing the
same interface — `getMembers()`, `pending()`, `claim()` — whose `claim()` returns
nothing, and share a link to it. The detail page therefore refuses to render
anything until the factory confirms the address came from it, via
`isOfficialSplitter`.

The home list is cached, so it seems tempting to read the answer from there and
skip the call. It is not enough: that cache is only warm if the visitor came
through the home page, and a shared link lands straight on `/s/0x…` with an empty
cache — precisely the case the check exists for. The cache can *confirm* an
address (present in the list means created by the factory) but never *refute* one,
since absence may only mean a cold cache. It is used as `initialData` for the
positive case, falling through to the call otherwise. It costs one `eth_call`.

The check also runs *before* reading the splitter, because `getMembers()` reverts
on a foreign contract and the page would otherwise spin forever.

What it does not do: it proves **provenance, not intent**. Anyone can create a
splitter through the official factory, with any members and any shares. The check
rules out imitations of the contract, not dishonest use of the real one.

---

## Transaction lifecycle

`useTx` is the single write path, reused by claim, claim-all, create and the demo
faucet:

1. **Simulate** — dry run against current state, before the user pays anything.
   Reverts surface as decoded custom errors, so the button is disabled with a
   reason instead of failing after signature.
2. **Sign** — `writeContractAsync`, wrapped so rejection returns to idle silently.
   Declining is a decision, not an error.
3. **Wait** — `waitForTransactionReceipt`, then check `receipt.status`. A mined
   transaction can still have reverted; treating inclusion as success is the
   classic bug.
4. **Invalidate** — refresh the affected queries so the UI reflects the new state
   without a reload.

`lib/errors.ts` walks viem's nested error causes and maps `Splitter__*` names to
readable messages.

---

## Known limitations

**Indexed data lags** the chain by one to two minutes. Balances are live.

**No WalletConnect**: read only on mobile browsers.

**No dark mode**, deliberately: one mode, done properly.

---

## Deployment

Docker Compose on a VPS behind Caddy, three containers: Postgres, the indexer
worker and this app.

One thing to get right: `NEXT_PUBLIC_*` variables are inlined by `next build`, so
they must be passed as **build args**, not runtime environment. Only
`INFURA_API_KEY` and `DATABASE_URL` are read at runtime. Passing the public ones at
runtime only produces an image that builds cleanly and then finds no factory.

The reverse proxy must allow POST to `/api/rpc` with a generous body size, since
viem batches JSON-RPC calls.
