# Revenue splitter — Splittr

An immutable on-chain revenue splitter. A team defines who gets what percentage,
once. Anyone can then send any ERC-20 token to the splitter's address — no
approval, no integration, no awareness that the address is anything special — and
each member withdraws their own share whenever they want.

**[Live demo →](https://revenue-splitter.yannduffo.xyz)** (Sepolia)

![demo](./docs/demo.gif)

---

## Why it's built this way

Two decisions carry the whole system.

**Pull, not push.** The contract never sends money on its own. Paying out to N
members on every incoming transfer would cost unbounded gas, and one recipient
whose address reverts on receive would freeze everyone else's income. Instead, a
deposit only bumps a single global counter — value received *per share* — and each
member holds their own checkpoint on it. What you're owed is the gap between the
counter and your checkpoint, times your shares. Adding a fiftieth member costs a
deposit nothing.

**Deposits are detected by balance difference.** There is no `deposit()` function. The contract compares its actual token balance against what it has already attributed, so a plain ERC-20 `transfer` to a splitter executes no code at all.
The money sits there until the next claim absorbs it — correctly and in full,
however many unrecorded deposits piled up. That is what lets a splitter be used as an ordinary payment address, and it handles fee-on-transfer tokens correctly for free, since only what actually arrived is ever distributed.

The **trade-off** is that nothing on-chain knows what a splitter has been paid in: no code runs, so nothing is recorded, and there is no list of the tokens it holds. Making deposits observable would take a deposit(token, amount) entry point : an approval, an integration, a payer who has to know they're paying a splitter. *Token discovery lives off-chain instead*, which is the cost of being payable by anyone with no integration at all.

There is no admin, no owner and no escape hatch. The allocation is fixed at
creation and nobody can change it, including the team that created it. Every
recovery path is also a theft path — the absence of one is the point.

## Reading the chain

Contract state (balances, pending amounts) is read live through view calls. Everything that comes from event logs (the splitter list, token discovery, history, claimed totals) is served by a small custom indexer.

Generic indexers watch contracts. Splittr needs the opposite: every ERC-20 `Transfer` *to* a growing set of addresses, whatever the token. Ponder, tried first, could only get there by ingesting every transfer on the chain (around 600k logs a day on Sepolia) to keep a handful.

The indexer asks the RPC for exactly what it needs instead: one `eth_getLogs` per block range, with the list of splitters as an OR filter on the recipient topic. A Node worker walks the chain with a single cursor, writes each range to Postgres in one transaction, stays a few blocks behind the head and rolls back when a reorg changes a block it already indexed. Next.js route handlers serve the result. The full history rebuilds in about 40 seconds.

The cost is eventual consistency: indexed data trails the chain by one to two minutes, while balances stay live.

## Try it

The live demo runs on Sepolia with two seeded splitters. Both are readable
without a wallet:

- **Splitter A** — two members, one token claimed, one untouched
- **Splitter B** — four members with uneven shares, deposits and claims
  interleaved over time, so everyone sits in a different position

The **Demo tools** panel mints test tokens and lets you send them to a splitter,
if you have a wallet with Sepolia ETH. Every member's balance moves at the next
block, in proportion to their share.

## Repository

```
revenue-splitter/
├── contracts/     Foundry: Solidity, 42 tests, deploy and seed scripts
├── indexer/       Node worker + Postgres: event logs for the web app
├── web/           Next.js dApp: wagmi, viem, API routes over the indexer
└── IDEAS.md       Deferred scope and future improvements
```

Each part has its own README: [contracts](./contracts/README.md) for the
accounting model and the test suite, [indexer](./indexer/README.md) for how the
chain is indexed, [web](./web/README.md) for the frontend architecture and its
technical trade-offs.

## Deployed on Sepolia

| | Address |
|---|---|
| SplitterFactory | [`0x2A8B…02e0`](https://sepolia.etherscan.io/address/0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0) |
| Splitter implementation | [`0x8371…8cDa`](https://sepolia.etherscan.io/address/0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa) |
| dEUR (demo token, 18 dec) | [`0x7B67…1a1b`](https://sepolia.etherscan.io/address/0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b) |
| dUSD (demo token, 6 dec) | [`0x40FA…7c0f`](https://sepolia.etherscan.io/address/0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) |

All verified.

## Running locally

```bash
# contracts
cd contracts && forge test
anvil                          # terminal 1
make deploy-seed-anvil         # terminal 2

# indexer (Postgres + worker)
cd indexer && docker compose up -d && npm install && npm run dev

# frontend
cd web && npm install && npm run wagmi && npm run dev
```

Details in each README.

## Known limitations

**Indexed data lags.** History, token discovery and claimed totals trail the chain by one to two minutes (poll interval plus confirmations), a deliberate trade to stay within Infura's free tier. Balances and pending amounts are always live.

**Mobile is read-only.** No WalletConnect connector yet, so browsers without an
injected wallet can browse but not transact.

**Not audited.** This is a portfolio project, not a production protocol.

## Prior art

[0xSplits](https://splits.org/) is the reference implementation of on-chain
payment splitting and has grown into a full platform covering far more ground.
This is a deliberately minimal take on the same core idea: immutable allocations,
pull-based claims, no admin, small enough to read end to end in one sitting.

## Roadmap

- [x] Contracts, tests, deployment and seeding scripts
- [x] Web interface — create, browse, claim, batch claim, activity history
- [x] Sepolia deployment with verified contracts and a live demo
- [x] v1.1 : responsive design for mobiles
- [x] v1.2 : HTML semantic, 3 mini features (isOfficialSplitter, token balances, footer), CI solidity pipeline
- [x] v1.3 : custom indexer (Node worker + Postgres), instant loads
- [ ] v2: native ETH, mutable allocations with a settlement path, delegated claims, WalletConnect for mobile

## License

MIT
