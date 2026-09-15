# Contracts

Foundry project for Revenue Splitter: an immutable, multi-token, pull-based ERC-20
revenue splitter, deployed as EIP-1167 minimal proxy clones from a single factory.

Design document, including every action, revert condition and invariant, is in
[SPEC.md](./SPEC.md).

---

## What it does

A team creates a splitter and assigns each member a fixed share in basis points. Anyone
can then send any ERC-20 token to that address with no integration, no approval and no
awareness that the address is anything special. Each member withdraws their own share
whenever they want.

The allocation is fixed at creation and no function can ever change it. There is no
admin, no owner, no recovery path.

## How it works

Two decisions carry most of the system.

**Pull, not push.** The contract never sends money on its own. Distributing to N members
on every incoming payment would cost unbounded gas, and a single recipient reverting on
receive would freeze everyone else's income. Instead, each payment increments one global
counter (the amount received *per share*), and each member holds a checkpoint on that
counter. What a member is owed is the gap between the counter and their checkpoint,
multiplied by their shares. Adding a fiftieth member costs a deposit exactly nothing.

**Deposits are detected by balance difference.** There is no `deposit()` function. The
contract infers incoming funds by comparing its actual token balance against what it has
already attributed, so a plain ERC-20 `transfer` to a splitter executes no code here at
all. The money sits there until the next claim absorbs it, correctly and in full, however
many unrecorded deposits piled up meanwhile. This is what lets a splitter be used as an
ordinary payment address, and it handles fee-on-transfer tokens correctly for free since
only what actually arrived is ever distributed.

## Layout

```
contracts/
├── src/
│   ├── Splitter.sol            accounting, claims
│   ├── SplitterFactory.sol     clone deployment, official-splitter registry
│   └── mocks/
│       └── DemoToken.sol       deployable ERC-20 with a public faucet, for the demo
├── test/
│   ├── SplitterTest.t.sol
│   ├── SplitterFactoryTest.t.sol
│   └── invariant/              Handler.t.sol, SplitterInvariant.t.sol
├── script/
│   ├── HelperConfig.s.sol      per-chain config, deploys mocks on anvil
│   ├── DeploySplitterFactory.s.sol
│   ├── DeployDemoTokens.s.sol
│   ├── CreateSplitter.s.sol
│   ├── SeedLocal.s.sol         full local demo environment
│   └── SeedSepolia.s.sol       public demo splitters on testnet
├── SPEC.md                     Contract design document: actions, invariants, rationale
├── Makefile
└── foundry.toml
```

| Contract | Role |
|---|---|
| `Splitter.sol` | Member list, share allocation, per-token accounting, claims. Never initialized outside a clone. |
| `SplitterFactory.sol` | Deploys clones of a single locked implementation and records which addresses it created. |

Cloning rather than deploying a full contract each time brings creation down by more than
an order of magnitude. The implementation marks itself initialized in its own constructor
so nobody can ever claim it, and each clone is initialized in the transaction that
creates it, so a clone is never observable in an uninitialized state.

Key constants: `TOTAL_SHARES = 10_000`, `PRECISION = 1e18`, `MAX_MEMBERS = 50`,
`MAX_CLAIM_BATCH = 20`.

## Testing

42 tests across three levels.

**Unit** covers nominal paths, every revert condition, and the edge cases that matter:
indivisible deposits, amounts that truncate to zero for small shareholders, batch claims
where some tokens have nothing to give, storage isolation between clones.

**Fuzz** covers conservation of value, agreement between what `pending` reports and what
a claim actually transfers, proportionality to shares, and the equivalence between two
successive deposits and a single deposit of their sum.

**Invariant** asserts five properties through a handler that fuzzes sequences of
deposits, claims and batch claims across five members and two tokens:

| | Property |
|---|---|
| INV-1 | Shares always sum to 10,000 |
| INV-2 | The sum of everyone's claimable amounts never exceeds the contract balance |
| INV-3 | Nothing appears from nowhere, and what disappears is bounded truncation dust |
| INV-5 | The accumulator and the bookkeeping counters never decrease |
| INV-6 | A member's entitlement only ever goes down through their own claim |

INV-4 (no double claim) is a single-sequence property and is covered by unit tests
instead.

Two profiles: the default one for fast feedback, `deep` for a much higher run count
before a commit or in CI.

```bash
forge test
FOUNDRY_PROFILE=deep forge test
```

## Run locally

Requires [Foundry](https://book.getfoundry.sh/). No `.env` is needed for local work; see
`.env.example` for the Sepolia targets.

```bash
anvil                      # terminal 1
make deploy-seed-anvil     # terminal 2
```

`SeedLocal.s.sol` deploys the factory, two mock ERC-20 tokens and two splitters: a
two-member 60/40 split, and a five-member split with uneven shares where some members
have already claimed and others have not. It prints every deployed address along with
each member's shares and current claimable balance.

`make deploy-anvil` deploys the factory alone.

## Demo tokens

`DemoToken` is a plain ERC-20 with a configurable number of decimals and a public
`faucet()` that mints 1,000 tokens to the caller. It exists so the live demo needs no
third-party faucet: a visitor connects a wallet, presses one button and can immediately
use a splitter. Two are deployed on testnet, one with 18 decimals and one with 6, since
differing decimals are where rounding behaviour actually shows.

It is not part of the protocol. Splitters accept any ERC-20 and know nothing about it.

## Notes for consumers

**`pending(token, member)` needs no prior transaction.** It simulates the pending sync
internally from the live balance, so it is accurate even for deposits the contract has
never recorded. Poll it directly.

**`claim` reverts on zero; `claimMany` does not.** A batch skips tokens with nothing to
give and only reverts when every token in it yields zero. Batches are capped at
`MAX_CLAIM_BATCH` tokens.

**There is no on-chain list of the tokens a splitter holds**, by design: nothing on-chain
ever loops over tokens, so nothing needs to enumerate them. Discovering them is left to
the consumer, by reading ERC-20 `Transfer` logs addressed to a splitter over a known
token list, plus a manual token-address input for anything outside that list.

**Small deposits can round a member's amount to zero.** The per-member amount truncates
down, so a member holding a handful of basis points sees nothing until enough value has
accumulated. Nothing is lost; it surfaces later.

## Deliberately out of scope

Native ETH (wrap to WETH), mutable allocations and the admin role that would come with
them, claiming on behalf of others, streaming. Rationale for each is in `SPEC.md`.

**Not audited.** Portfolio project, testnet only.
